/**
 * GPSWOX / Traccar Public Hardware Tunnel & Remote Tracking Connector
 * 
 * Allows real GPS tracker hardware (Concox, Teltonika, Coban, Sinotrack)
 * and mobile phones running Traccar Client anywhere in the world to connect
 * to this server over the internet.
 */

import { exec } from "child_process";
import http from "http";

console.log("=======================================================");
console.log("🌐 GPSWOX Enterprise - Public Tracker Tunnel Manager");
console.log("=======================================================");
console.log("This utility helps expose your local GPS receiver ports to the internet");
console.log("so that physical trackers in cars or mobile apps can send data from anywhere.\n");

console.log("📡 Available GPS Protocols & Local Listening Ports:");
console.log("  1. OsmAnd / Traccar Mobile App: HTTP Port 5055");
console.log("  2. Concox / GT06 / SinoTrack:   TCP  Port 5023");
console.log("  3. Teltonika Code 8 / FMB920:   TCP  Port 5027");
console.log("  4. Coban / GPS103 / TK103:      TCP  Port 5001");
console.log("  5. REST API & WebSocket:        HTTP Port 3001\n");

console.log("🔧 Quick Setup Options for Public Internet Connection:");
console.log("-------------------------------------------------------");
console.log("Option A: Ngrok TCP / HTTP (Recommended for testing):");
console.log("  - For Mobile Apps (OsmAnd HTTP):");
console.log("      npx ngrok http 5055");
console.log("  - For Concox GT06 Tracker (TCP):");
console.log("      npx ngrok tcp 5023");
console.log("  - For Teltonika Tracker (TCP):");
console.log("      npx ngrok tcp 5027\n");

console.log("Option B: Router Port Forwarding (Recommended for Production 24/7):");
console.log("  1. Open your router settings (e.g., 192.168.1.1).");
console.log("  2. Forward External Ports 5023, 5027, 5001, 5055 to this computer's local IP.");
console.log("  3. Use your Public Static IP or dynamic DNS (e.g. yourname.ddns.net).\n");

console.log("📲 How to Configure Physical Trackers via SMS:");
console.log("-------------------------------------------------------");
console.log("• Concox GT06 / SinoTrack SMS Commands:");
console.log("    SERVER,1,<PUBLIC_IP>,5023,0#");
console.log("    TIMER,10,60#  (Upload every 10s when moving, 60s when stopped)");
console.log("");
console.log("• Coban TK103 / GPS103 SMS Commands:");
console.log("    adminip123456 <PUBLIC_IP> 5001");
console.log("    fix010s***n123456");
console.log("");
console.log("• Traccar Client (iOS & Android Free App):");
console.log("    1. Install 'Traccar Client' from App Store / Google Play.");
console.log("    2. Set Device Identifier to your phone's IMEI or ID (e.g., 868120045678901).");
console.log("    3. Set Server URL to: http://<PUBLIC_IP_OR_NGROK>:5055");
console.log("    4. Toggle Service Status to ON!");
console.log("=======================================================");
