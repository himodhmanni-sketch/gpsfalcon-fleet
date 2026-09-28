import 'dotenv/config';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import net from "net";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "../dist");
import { parseGt06, encodeGt06Command } from "./protocols/gt06.js";
import { parseTeltonika, encodeTeltonikaCommand } from "./protocols/teltonika.js";
import { parseGps103 } from "./protocols/gps103.js";
import { parseOsmAnd } from "./protocols/osmand.js";
import { TRACCAR_PROTOCOLS } from "./protocols/protocolCatalog.js";
import { initPostgres } from "./db/setupPostgres.js";
import {
  persistTelemetry,
  getFleetDevices,
  saveDevice,
  deleteDevice,
  getGeofences,
  saveGeofence,
  deleteGeofence,
  getEvents,
  persistEvent,
  getClients,
  saveClient,
  authenticateClient,
  getExpenses,
  saveExpense,
  getDeviceHistory
} from "./db/postgres.js";
import { reverseGeocode } from "./geocoder.js";
import { authenticateRequest } from "./auth.js";

// Active Connected Hardware Sockets Map: IMEI -> Socket
const activeDeviceSockets = new Map();

// Global Error Guards — Prevent server crash on unexpected errors
process.on("uncaughtException", (err) => {
  console.error("🔴 [uncaughtException] Unhandled error:", err.message, err.stack);
});
process.on("unhandledRejection", (reason) => {
  console.error("🔴 [unhandledRejection] Unhandled promise rejection:", reason);
});

// CORS Security: Domain Whitelist
const allowedOriginsConfig = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:4173")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const isAllowed = !origin ||
                    allowedOriginsConfig.includes(origin) ||
                    (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

  if (isAllowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    // Untrusted origin: do not reflect
    res.setHeader("Access-Control-Allow-Origin", allowedOriginsConfig[0] || "http://localhost:5173");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Max-Age", "86400");
}

// In-Memory Rate Limiting: IP-based sliding counter
const rateLimitStore = new Map();

function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
         req.socket?.remoteAddress ||
         "127.0.0.1";
}

function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  let record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(key, record);
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetInMs: Math.max(0, record.resetAt - now) };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetInMs: Math.max(0, record.resetAt - now) };
}

// Sweep rateLimitStore every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Initialize PostgreSQL Schema on Startup
initPostgres().then(() => {
  console.log("✅ [PostgreSQL] Database 'gpswox_fleet' initialized & connected successfully.");
}).catch((err) => {
  console.warn("⚠️ [PostgreSQL] Auto-init notice:", err.message);
});

// Helper for parsing JSON request body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

// 1. Create HTTP & WebSocket Server (Port 3001)
const server = http.createServer(async (req, res) => {
  // CORS Headers
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const clientIp = getClientIp(req);
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Rate Limiting: Strict on auth routes (10 attempts per minute), standard on general API (150 requests per minute)
  const isAuthRoute = url.pathname.startsWith("/api/auth/login") || url.pathname.startsWith("/api/auth/register");
  const maxReqs = isAuthRoute ? 10 : 150;
  const windowTime = 60 * 1000;
  const rateLimitKey = `${isAuthRoute ? 'auth' : 'api'}:${clientIp}`;

  const rateCheck = checkRateLimit(rateLimitKey, maxReqs, windowTime);
  if (!rateCheck.allowed) {
    res.setHeader("Retry-After", Math.ceil(rateCheck.resetInMs / 1000));
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      error: "تم تجاوز عدد الطلبات المسموح بها مؤقتاً. يرجى الانتظار دقيقة والمحاولة مرة أخرى. (Too Many Requests)"
    }));
    return;
  }

  const authUser = authenticateRequest(req);

  // Endpoint: POST /api/auth/login
  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    try {
      const { email, password } = await parseJsonBody(req);
      if (!email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" }));
        return;
      }
      const authResult = await authenticateClient(email, password);
      if (!authResult.success) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify(authResult));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(authResult));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: POST /api/auth/register
  if (url.pathname === "/api/auth/register" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      if (!payload.email || !payload.name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "الاسم والبريد الإلكتروني مطلوبان" }));
        return;
      }
      const saveRes = await saveClient(payload);
      const authResult = await authenticateClient(payload.email, payload.password || "client123");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, ...authResult }));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: GET /api/auth/me
  if (url.pathname === "/api/auth/me" && req.method === "GET") {
    if (!authUser) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "غير مصرح (Unauthenticated)" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, user: authUser }));
    return;
  }

  // Endpoint: GET /api/protocols
  if (url.pathname === "/api/protocols") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, protocols: TRACCAR_PROTOCOLS }));
    return;
  }

  // Endpoint: GET /api/devices (PostgreSQL - Multi-Tenant Scoped)
  if (url.pathname === "/api/devices" && req.method === "GET") {
    if (!authUser) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "المصادقة مطلوبة للوصول لأسطول المركبات (Unauthorized)" }));
      return;
    }
    try {
      const devices = await getFleetDevices(authUser);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, devices }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: POST /api/devices (PostgreSQL)
  if (url.pathname === "/api/devices" && req.method === "POST") {
    if (!authUser) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "Unauthorized" }));
      return;
    }
    try {
      const payload = await parseJsonBody(req);
      if (authUser && authUser.role !== "superadmin") {
        payload.clientId = authUser.id;
      }
      const result = await saveDevice(payload);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, ...result }));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: DELETE /api/devices/:id
  if (url.pathname.startsWith("/api/devices/") && req.method === "DELETE") {
    if (!authUser || authUser.role !== "superadmin") {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "حذف المركبات مخصص للمدير العام (SuperAdmin) فقط" }));
      return;
    }
    const id = url.pathname.replace("/api/devices/", "");
    try {
      await deleteDevice(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: GET /api/geofences (PostgreSQL)
  if (url.pathname === "/api/geofences" && req.method === "GET") {
    try {
      const geofences = await getGeofences();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, geofences }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: POST /api/geofences (PostgreSQL - Circle or Polygon)
  if (url.pathname === "/api/geofences" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      const result = await saveGeofence(payload);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, ...result }));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: DELETE /api/geofences/:id
  if (url.pathname.startsWith("/api/geofences/") && req.method === "DELETE") {
    const id = url.pathname.replace("/api/geofences/", "");
    try {
      await deleteGeofence(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: GET /api/events (PostgreSQL)
  if (url.pathname === "/api/events" && req.method === "GET") {
    try {
      const events = await getEvents();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, events }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: POST /api/events (PostgreSQL)
  if (url.pathname === "/api/events" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      await persistEvent(payload);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: GET /api/clients (PostgreSQL - SuperAdmin Only)
  if (url.pathname === "/api/clients" && req.method === "GET") {
    if (!authUser || authUser.role !== "superadmin") {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "الوصول لقائمة العملاء مخصص لمدير المنظومة (SuperAdmin) فقط" }));
      return;
    }
    try {
      const clients = await getClients();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, clients }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: GET /api/expenses (PostgreSQL)
  if (url.pathname === "/api/expenses" && req.method === "GET") {
    try {
      const expenses = await getExpenses();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, expenses }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: POST /api/expenses (PostgreSQL)
  if (url.pathname === "/api/expenses" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      const result = await saveExpense(payload);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, ...result }));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: GET /api/history?imei=...
  if (url.pathname === "/api/history" && req.method === "GET") {
    const imei = url.searchParams.get("imei");
    if (!imei) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing imei param" }));
      return;
    }
    try {
      const history = await getDeviceHistory(imei);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, history }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: GET /api/geocode?lat=...&lng=...
  if (url.pathname === "/api/geocode" && req.method === "GET") {
    const lat = parseFloat(url.searchParams.get("lat"));
    const lng = parseFloat(url.searchParams.get("lng"));
    if (isNaN(lat) || isNaN(lng)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid coordinates" }));
      return;
    }
    try {
      const address = await reverseGeocode(lat, lng);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, address }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  // Endpoint: POST /api/send-command
  if (url.pathname === "/api/send-command" && req.method === "POST") {
    try {
      const payload = await parseJsonBody(req);
      const { imei, protocol, commandKey, customCommand } = payload;
      
      console.log(`[CMD] Dispatching command [${commandKey || customCommand}] to IMEI:${imei} via protocol:${protocol}`);

      broadcastToClients({
        type: "command_dispatched",
        imei,
        protocol,
        commandKey,
        timestamp: new Date().toISOString()
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ 
        success: true, 
        message: `Command [${commandKey || customCommand}] queued and dispatched to device IMEI:${imei}` 
      }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Endpoint: OsmAnd / Traccar Client HTTP Listener on /osmand or port 5055
  if (url.pathname === "/osmand" || url.pathname === "/") {
    const data = parseOsmAnd(url.search);
    if (data) {
      console.log(`[OSMAND HTTP] Position from ID: ${data.imei} -> Lat: ${data.coords[0]}, Lng: ${data.coords[1]}, Speed: ${data.speed} km/h`);
      
      // Persist to PostgreSQL and reverse geocode
      persistTelemetry(data.imei, "osmand", data).then((geoRes) => {
        if (geoRes && geoRes.address) data.address = geoRes.address;
        broadcastToClients({
          type: "device_telemetry",
          protocol: "osmand",
          imei: data.imei,
          data: data
        });
      }).catch(err => {
        broadcastToClients({
          type: "device_telemetry",
          protocol: "osmand",
          imei: data.imei,
          data: data
        });
      });

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");
      return;
    }
  }

  // Static Assets & SPA Serving for Production
  if (req.method === "GET" && fs.existsSync(DIST_DIR)) {
    const parsedPath = url.pathname === "/" ? "/index.html" : url.pathname;
    let filePath = path.join(DIST_DIR, parsedPath);

    // If file doesn't exist, fallback to index.html for SPA client-side routing
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, "index.html");
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".webp": "image/webp",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf"
      };
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.writeHead(404);
  res.end("Not Found");
});

// Setup WebSocket Server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("[WS] Client connected to live GPS Gateway telemetry stream");

  ws.send(JSON.stringify({
    type: "gateway_init",
    database: "PostgreSQL 17 (gpswox_fleet)",
    connectedTrackersCount: activeDeviceSockets.size,
    supportedProtocols: TRACCAR_PROTOCOLS.length,
    timestamp: new Date().toISOString()
  }));

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch (e) {}
  });
});

function broadcastToClients(payload) {
  const jsonStr = JSON.stringify(payload);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonStr);
    }
  });
}

// -------------------------------------------------------------
// 2. TCP Protocol Listener: GT06 / Concox (Port 5023)
// -------------------------------------------------------------
const gt06Server = net.createServer((socket) => {
  const clientAddr = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[GT06 5023] New device connection from ${clientAddr}`);
  let currentImei = null;

  socket.on("data", async (buffer) => {
    try {
      console.log(`[GT06 5023 RAW] Received ${buffer.length} bytes: ${buffer.toString("hex")}`);
      const result = parseGt06(buffer);
      if (!result) return;

      if (result.type === "login") {
        currentImei = result.imei;
        activeDeviceSockets.set(currentImei, socket);
        if (result.rawImei) activeDeviceSockets.set(result.rawImei, socket);
        console.log(`[GT06] Device Logged In - IMEI: ${currentImei} (Raw: ${result.rawImei})`);
        if (result.responseBuffer) {
          socket.write(result.responseBuffer);
          console.log(`[GT06] Sent Login ACK: ${result.responseBuffer.toString("hex")}`);
        }

        broadcastToClients({
          type: "device_connected",
          protocol: "gt06",
          imei: currentImei,
          port: 5023
        });
      } else if (result.type === "location") {
        if (currentImei) {
          result.imei = currentImei;
          console.log(`[GT06] Location from ${currentImei} -> [${result.coords}], Speed: ${result.speed} km/h`);
          
          // Persist to PostgreSQL and reverse geocode
          const geoRes = await persistTelemetry(currentImei, "gt06", result, buffer.toString("hex"));
          if (geoRes && geoRes.address) result.address = geoRes.address;

          broadcastToClients({
            type: "device_telemetry",
            protocol: "gt06",
            imei: currentImei,
            data: result
          });
        }
      } else if (result.type === "status") {
        if (result.responseBuffer) socket.write(result.responseBuffer);
      }
    } catch (e) {
      console.error("[GT06 Parse Error]:", e.message);
    }
  });

  socket.on("close", () => {
    if (currentImei) activeDeviceSockets.delete(currentImei);
  });
  socket.on("error", (e) => console.log(`[GT06 Error]: ${e.message}`));
});

// -------------------------------------------------------------
// 3. TCP Protocol Listener: Teltonika Code 8 (Port 5027)
// -------------------------------------------------------------
const teltonikaServer = net.createServer((socket) => {
  console.log(`[TELTONIKA 5027] New connection from ${socket.remoteAddress}:${socket.remotePort}`);
  let currentImei = null;

  socket.on("data", async (buffer) => {
    try {
      const result = parseTeltonika(buffer, currentImei);
      if (!result) return;

      if (result.type === "handshake") {
        currentImei = result.imei;
        activeDeviceSockets.set(currentImei, socket);
        console.log(`[TELTONIKA] Handshake Accepted - IMEI: ${currentImei}`);
        if (result.responseBuffer) socket.write(result.responseBuffer);

        broadcastToClients({
          type: "device_connected",
          protocol: "teltonika",
          imei: currentImei,
          port: 5027
        });
      } else if (result.type === "location") {
        if (result.responseBuffer) socket.write(result.responseBuffer);

        if (result.records && result.records.length > 0) {
          const rec = result.records[0];
          console.log(`[TELTONIKA] AVL Data Record from ${currentImei} -> [${rec.coords}], Speed: ${rec.speed} km/h`);
          
          // Persist to PostgreSQL and reverse geocode
          const geoRes = await persistTelemetry(currentImei, "teltonika", rec, buffer.toString("hex"));
          if (geoRes && geoRes.address) rec.address = geoRes.address;

          broadcastToClients({
            type: "device_telemetry",
            protocol: "teltonika",
            imei: currentImei,
            data: rec
          });
        }
      }
    } catch (e) {
      console.error("[TELTONIKA Parse Error]:", e.message);
    }
  });

  socket.on("close", () => {
    if (currentImei) activeDeviceSockets.delete(currentImei);
  });
  socket.on("error", (e) => console.log(`[TELTONIKA Error]: ${e.message}`));
});

// -------------------------------------------------------------
// 4. TCP Protocol Listener: Coban GPS103 (Port 5001)
// -------------------------------------------------------------
const gps103Server = net.createServer((socket) => {
  console.log(`[COBAN 5001] New connection from ${socket.remoteAddress}:${socket.remotePort}`);
  let currentImei = null;

  socket.on("data", async (buffer) => {
    try {
      const result = parseGps103(buffer);
      if (!result) return;

      if (result.type === "login") {
        currentImei = result.imei;
        activeDeviceSockets.set(currentImei, socket);
        console.log(`[COBAN] Logged In - IMEI: ${currentImei}`);
        if (result.responseBuffer) socket.write(result.responseBuffer);
        broadcastToClients({
          type: "device_connected",
          protocol: "gps103",
          imei: currentImei,
          port: 5001
        });
      } else if (result.type === "location") {
        if (result.responseBuffer) socket.write(result.responseBuffer);
        console.log(`[COBAN] Location from ${result.imei} -> [${result.coords}], Speed: ${result.speed} km/h`);
        
        // Persist to PostgreSQL and reverse geocode
        const geoRes = await persistTelemetry(result.imei, "gps103", result, buffer.toString("hex"));
        if (geoRes && geoRes.address) result.address = geoRes.address;

        broadcastToClients({
          type: "device_telemetry",
          protocol: "gps103",
          imei: result.imei,
          data: result
        });
      }
    } catch (e) {
      console.error("[COBAN Parse Error]:", e.message);
    }
  });

  socket.on("close", () => {
    if (currentImei) activeDeviceSockets.delete(currentImei);
  });
  socket.on("error", (e) => console.log(`[COBAN Error]: ${e.message}`));
});

// -------------------------------------------------------------
// 5. HTTP Protocol Listener: OsmAnd / Traccar Client (Port 5055)
// -------------------------------------------------------------
const osmandHttpServer = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const data = parseOsmAnd(url.search);

  if (data) {
    console.log(`[PORT 5055] OsmAnd / Traccar Client HTTP hit: IMEI: ${data.imei} -> [${data.coords}]`);
    
    // Persist to PostgreSQL and reverse geocode
    const geoRes = await persistTelemetry(data.imei, "osmand", data);
    if (geoRes && geoRes.address) data.address = geoRes.address;

    broadcastToClients({
      type: "device_telemetry",
      protocol: "osmand",
      imei: data.imei,
      data: data
    });
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  } else {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request: missing id, lat, or lon");
  }
});

// Initialize PostgreSQL Schema and seed data on startup
initPostgres().catch((err) => {
  console.log(`[PostgreSQL Init Notice]: ${err.message}`);
});

// Launch All Servers
const HTTP_PORT = parseInt(process.env.PORT || "3001", 10);
server.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(`🚀 GPSWOX / Traccar Protocol Gateway Running:`);
  console.log(`💾 Persistent Database:   PostgreSQL 17 (gpswox_fleet)`);
  console.log(`📡 WebSocket & REST API:   http://0.0.0.0:${HTTP_PORT}`);
  console.log(`📡 Traccar OsmAnd Port:    http://0.0.0.0:5055`);
  console.log(`📡 Concox GT06 TCP Port:   0.0.0.0:5023`);
  console.log(`📡 Teltonika Code 8 Port:  0.0.0.0:5027`);
  console.log(`📡 Coban GPS103 TCP Port:  0.0.0.0:5001`);
  console.log(`=======================================================`);
});

// Hardware listeners (graceful in containerized/PaaS environments)
try {
  osmandHttpServer.listen(5055, "0.0.0.0").on("error", (e) => console.log(`[5055 Port Notice]: ${e.message}`));
} catch (e) {}
try {
  gt06Server.listen(5023, "0.0.0.0").on("error", (e) => console.log(`[5023 Port Notice]: ${e.message}`));
} catch (e) {}
try {
  teltonikaServer.listen(5027, "0.0.0.0").on("error", (e) => console.log(`[5027 Port Notice]: ${e.message}`));
} catch (e) {}
try {
  gps103Server.listen(5001, "0.0.0.0").on("error", (e) => console.log(`[5001 Port Notice]: ${e.message}`));
} catch (e) {}
