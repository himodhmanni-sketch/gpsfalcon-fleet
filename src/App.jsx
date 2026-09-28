import React, { useState, useEffect, Suspense, lazy } from "react";
import { MapView } from "./components/MapView";
import { HistoryPlayer } from "./components/HistoryPlayer";
import { OfficialSidebar } from "./components/OfficialSidebar";
import { OfficialObjectsPanel } from "./components/OfficialObjectsPanel";
import { OfficialBottomDock } from "./components/OfficialBottomDock";
import { OfficialMapToolbar } from "./components/OfficialMapToolbar";
import { LoginPage } from "./components/LoginPage";
import { getAuthorizedVehicles } from "./utils/rbac";
import { API_ENDPOINTS, WS_BASE } from "./config/api";

// Lazy-loaded Modals & Portals for Bundle Optimization
const OfficialAdminPortal = lazy(() => import("./components/OfficialAdminPortal").then(m => ({ default: m.OfficialAdminPortal })));
const AdminPortalModal = lazy(() => import("./components/AdminPortalModal").then(m => ({ default: m.AdminPortalModal })));
const ResellerPortalModal = lazy(() => import("./components/ResellerPortalModal").then(m => ({ default: m.ResellerPortalModal })));
const FleetDriversModal = lazy(() => import("./components/FleetDriversModal").then(m => ({ default: m.FleetDriversModal })));
const AlertsModal = lazy(() => import("./components/AlertsModal").then(m => ({ default: m.AlertsModal })));
const HistoryModal = lazy(() => import("./components/HistoryModal").then(m => ({ default: m.HistoryModal })));
const ReportsModal = lazy(() => import("./components/ReportsModal").then(m => ({ default: m.ReportsModal })));
const CommandsModal = lazy(() => import("./components/CommandsModal").then(m => ({ default: m.CommandsModal })));
const CameraMediaModal = lazy(() => import("./components/CameraMediaModal").then(m => ({ default: m.CameraMediaModal })));
const SharingModal = lazy(() => import("./components/SharingModal").then(m => ({ default: m.SharingModal })));
const GeofenceModal = lazy(() => import("./components/GeofenceModal").then(m => ({ default: m.GeofenceModal })));
const AddDeviceModal = lazy(() => import("./components/AddDeviceModal").then(m => ({ default: m.AddDeviceModal })));
const EditDeviceModal = lazy(() => import("./components/EditDeviceModal").then(m => ({ default: m.EditDeviceModal })));
const MaintenanceModal = lazy(() => import("./components/MaintenanceModal").then(m => ({ default: m.MaintenanceModal })));
const ExpensesModal = lazy(() => import("./components/ExpensesModal").then(m => ({ default: m.ExpensesModal })));
const TemplatesModal = lazy(() => import("./components/TemplatesModal").then(m => ({ default: m.TemplatesModal })));
const SensorsModal = lazy(() => import("./components/SensorsModal").then(m => ({ default: m.SensorsModal })));
const AccountModal = lazy(() => import("./components/AccountModal").then(m => ({ default: m.AccountModal })));
const HelpGuideModal = lazy(() => import("./components/HelpGuideModal").then(m => ({ default: m.HelpGuideModal })));
const TraccarHubModal = lazy(() => import("./components/TraccarHubModal").then(m => ({ default: m.TraccarHubModal })));

function ModalLoadingFallback() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(10, 15, 29, 0.7)',
      backdropFilter: 'blur(6px)',
      color: '#00b4c6',
      fontSize: '15px',
      fontFamily: 'inherit'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '24px 36px',
        background: '#151d30',
        borderRadius: '12px',
        border: '1px solid rgba(0, 180, 198, 0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          border: '3px solid rgba(0, 180, 198, 0.2)',
          borderTopColor: '#00b4c6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span>جاري التحميل...</span>
      </div>
    </div>
  );
}

// Data Stores
import { initialVehicles } from "./data/mockVehicles";
import { initialGeofences } from "./data/mockGeofences";
import { initialEvents } from "./data/mockEvents";
import { initialClients } from "./data/mockClients";
import { initialAlertRules } from "./data/mockAlertRules";
import { initialExpenses } from "./data/mockExpenses";
import { translations } from "./data/translations";
import { soundFX } from "./utils/audioAlert";

import "./App.css";
import "./official-gpswox.css";

export function App() {
  const [lang, setLang] = useState("ar");
  const [theme, _setTheme] = useState("dark");

  const t = translations[lang];

  // Production JWT Authentication & Multi-Tenant State
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem("gpswox_token") || sessionStorage.getItem("gpswox_token") || null;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("gpswox_user") || sessionStorage.getItem("gpswox_user");
      return stored ? JSON.parse(stored) : null;
    } catch(e) {
      return null;
    }
  });
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  // Fleet & Telemetry State (Strict multi-tenant initialization via RBAC)
  const [vehicles, setVehicles] = useState(() => {
    try {
      const stored = localStorage.getItem("gpswox_user") || sessionStorage.getItem("gpswox_user");
      const user = stored ? JSON.parse(stored) : null;
      return getAuthorizedVehicles(initialVehicles, user);
    } catch(e) {
      return initialVehicles;
    }
  });
  const [geofences, setGeofences] = useState(initialGeofences);
  const [events, setEvents] = useState(initialEvents);
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem("gpswox_custom_clients");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialClients;
  });

  // Save clients to localStorage on updates
  React.useEffect(() => {
    try {
      localStorage.setItem("gpswox_custom_clients", JSON.stringify(clients));
    } catch(e) {}
  }, [clients]);
  const [alertRules, setAlertRules] = useState(initialAlertRules);
  const [expenses, setExpenses] = useState(initialExpenses);
  
  // Selection & Visibility
  const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
    try {
      const stored = localStorage.getItem("gpswox_user") || sessionStorage.getItem("gpswox_user");
      const user = stored ? JSON.parse(stored) : null;
      const authed = getAuthorizedVehicles(initialVehicles, user);
      return authed[0]?.id || "vh-869727071244774";
    } catch(e) {
      return "vh-869727071244774";
    }
  });
  const [visibleVehicleIds, setVisibleVehicleIds] = useState(() => {
    try {
      const stored = localStorage.getItem("gpswox_user") || sessionStorage.getItem("gpswox_user");
      const user = stored ? JSON.parse(stored) : null;
      const authed = getAuthorizedVehicles(initialVehicles, user);
      return authed.map(v => v.id);
    } catch(e) {
      return initialVehicles.map(v => v.id);
    }
  });
  const [followVehicleId, _setFollowVehicleId] = useState(null);

  const [centerTarget, setCenterTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Layout & UI Tabs
  const [viewMode, setViewMode] = useState("map"); // 'map' | 'admin'
  const [activeTab, setActiveTab] = useState("objects");
  const [isSidebarCollapsed] = useState(false);
  const [isSimulating] = useState(true);

  const [soundMuted, setSoundMuted] = useState(false);

  // Map Controls State
  const [mapAction, setMapAction] = useState(null);
  const [activeLayerKey, setActiveLayerKey] = useState("googleRoad");
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [snapToRoads, setSnapToRoads] = useState(true);

  // Modals & Panels State
  const [showAdminPortalModal, setShowAdminPortalModal] = useState(false);
  const [showResellerPortalModal, setShowResellerPortalModal] = useState(false);
  const [showFleetDriversModal, setShowFleetDriversModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showCommandsModal, setShowCommandsModal] = useState(false);
  const [commandTargetVehicle, setCommandTargetVehicle] = useState(null);
  const [defaultCommandType, setDefaultCommandType] = useState("immobilize");
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpInitialTab, setHelpInitialTab] = useState("upgrade");
  const [showEditDeviceModal, setShowEditDeviceModal] = useState(false);
  const [editTargetVehicle, setEditTargetVehicle] = useState(null);
  const [showSensorsModal, setShowSensorsModal] = useState(false);
  const [sensorsTargetVehicle, setSensorsTargetVehicle] = useState(null);
  const [showTraccarHubModal, setShowTraccarHubModal] = useState(false);
  const [isGatewayConnected, setIsGatewayConnected] = useState(false);

  // Route Playback on Map
  const [playbackVehicle, setPlaybackVehicle] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(null);

  // Synchronize document dir and theme
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.className = `theme-${theme}`;
  }, [lang, theme]);

  // Sync with PostgreSQL Database with Authenticated Scoped Token
  const syncPostgreSQLFleet = async (tokenToUse = authToken, userToUse = currentUser) => {
    if (!tokenToUse) return;
    try {
      const authHeaders = { "Authorization": `Bearer ${tokenToUse}` };
      const isSuper = (userToUse?.role === "superadmin");
      
      const fetchList = [
        fetch(API_ENDPOINTS.devices, { headers: authHeaders }).then(r => r.json()),
        fetch(API_ENDPOINTS.geofences, { headers: authHeaders }).then(r => r.json()),
        fetch(API_ENDPOINTS.events, { headers: authHeaders }).then(r => r.json()),
        fetch(API_ENDPOINTS.expenses, { headers: authHeaders }).then(r => r.json())
      ];
      if (isSuper) {
        fetchList.push(fetch(API_ENDPOINTS.clients, { headers: authHeaders }).then(r => r.json()));
      }

      const results = await Promise.allSettled(fetchList);
      const devRes = results[0];
      const geoRes = results[1];
      const evtRes = results[2];
      const expRes = results[3];
      const cliRes = isSuper ? results[4] : null;

      if (devRes.status === "fulfilled" && devRes.value.success && Array.isArray(devRes.value.devices)) {
        const authedDevices = getAuthorizedVehicles(devRes.value.devices, userToUse);
        if (authedDevices.length > 0) {
          setVehicles(authedDevices);
          setVisibleVehicleIds(authedDevices.map(d => d.id));
          setSelectedVehicleId(authedDevices[0].id);
          if (authedDevices[0]?.coords) {
            setCenterTarget({ coords: authedDevices[0].coords, timestamp: Date.now() });
          }
        }
      }

      if (geoRes.status === "fulfilled" && geoRes.value.success && geoRes.value.geofences?.length > 0) {
        setGeofences(geoRes.value.geofences);
      }

      if (evtRes.status === "fulfilled" && evtRes.value.success && evtRes.value.events?.length > 0) {
        setEvents(evtRes.value.events);
      }

      if (cliRes && cliRes.status === "fulfilled" && cliRes.value.success && cliRes.value.clients?.length > 0) {
        setClients(cliRes.value.clients);
      }

      if (expRes.status === "fulfilled" && expRes.value.success && expRes.value.expenses?.length > 0) {
        setExpenses(expRes.value.expenses);
      }
    } catch (err) {
      console.warn("[PostgreSQL Sync] Error:", err.message);
    }
  };

  useEffect(() => {
    if (authToken && currentUser) {
      syncPostgreSQLFleet(authToken, currentUser);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, currentUser]);


  const handleLoginSuccess = (user, token) => {
    setAuthToken(token);
    setCurrentUser(user);
    setJustLoggedOut(false);
    const authedVehicles = getAuthorizedVehicles(initialVehicles, user);
    setVehicles(authedVehicles);
    setSelectedVehicleId(authedVehicles[0]?.id || null);
    setVisibleVehicleIds(authedVehicles.map(v => v.id));
    if (authedVehicles[0]?.coords) {
      setCenterTarget({ coords: authedVehicles[0].coords, timestamp: Date.now() });
    }
    syncPostgreSQLFleet(token, user);
  };

  const handleLogout = () => {
    localStorage.removeItem("gpswox_token");
    localStorage.removeItem("gpswox_user");
    sessionStorage.removeItem("gpswox_token");
    sessionStorage.removeItem("gpswox_user");
    setAuthToken(null);
    setCurrentUser(null);
    setVehicles([]);
    setVisibleVehicleIds([]);
    setShowAdminPortalModal(false);
    setShowAccountModal(false);
    setShowEditDeviceModal(false);
    setShowAddDeviceModal(false);
    setShowTraccarHubModal(false);
    setJustLoggedOut(true);
  };

  // Live WebSocket Connection to Node.js Traccar Protocol Gateway (Port 3001)
  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let retryAttempt = 0;
    let isUnmounted = false;

    const connectWs = () => {
      if (isUnmounted) return;
      try {
        ws = new WebSocket(WS_BASE);

        ws.onopen = () => {
          console.log("[WS Client] Connected to GPS Protocol Gateway Server!");
          setIsGatewayConnected(true);
          retryAttempt = 0;
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "device_telemetry") {
              const { imei, data } = msg;

              setVehicles(prev => {
                const foundIndex = prev.findIndex(v => 
                  String(v.imei || "").trim() === String(imei || "").trim() || 
                  String(v.id || "").trim() === String(imei || "").trim() ||
                  String(v.id || "").trim() === `vh-${imei}`
                );

                if (foundIndex >= 0) {
                  const updated = [...prev];
                  const current = updated[foundIndex];
                  const newCoords = data.coords || current.coords;
                  const newSpeed = data.speed !== undefined ? Number(data.speed) : current.speed;
                  const newHeading = data.heading !== undefined ? Number(data.heading) : current.heading;
                  
                  updated[foundIndex] = {
                    ...current,
                    coords: newCoords,
                    speed: newSpeed,
                    heading: newHeading,
                    ignition: data.ignition !== undefined ? !!data.ignition : current.ignition,
                    batteryVoltage: data.batteryVoltage !== undefined ? Number(data.batteryVoltage) : current.batteryVoltage,
                    gsmSignal: data.gsmSignal !== undefined ? Number(data.gsmSignal) : current.gsmSignal,
                    status: newSpeed > 3 ? "moving" : (current.ignition ? "idle" : "stopped"),
                    address: data.address || current.address,
                    lastUpdate: "Just now",
                    historyPath: [...(current.historyPath || []), newCoords]
                  };
                  return updated;
                } else {
                  // Brand new tracker detected transmitting data
                  const newCoords = data.coords || [24.7136, 46.6753];
                  const newSpeed = Number(data.speed || 0);
                  const newDev = {
                    id: `vh-${imei}`,
                    name: `مركبة ${String(imei).slice(-4)}`,
                    imei: String(imei),
                    coords: newCoords,
                    speed: newSpeed,
                    heading: Number(data.heading || 0),
                    ignition: !!data.ignition,
                    batteryVoltage: Number(data.batteryVoltage || 12.6),
                    gsmSignal: Number(data.gsmSignal || 100),
                    status: newSpeed > 3 ? "moving" : "stopped",
                    address: data.address || "موقع نشط",
                    lastUpdate: "Just now",
                    historyPath: [newCoords],
                    driver: { name: "سائق غير معين", phone: "" }
                  };
                  setVisibleVehicleIds(vIds => [...vIds, newDev.id]);
                  return [newDev, ...prev];
                }
              });

              if (!soundMuted) soundFX.playChime();
            }
          } catch (err) {
            console.error("[WS Client] Error parsing telemetry message:", err);
          }
        };

        const scheduleReconnect = () => {
          if (isUnmounted) return;
          setIsGatewayConnected(false);
          const delay = Math.min(1000 * Math.pow(1.5, retryAttempt), 20000) + Math.random() * 1000;
          retryAttempt++;
          reconnectTimeout = setTimeout(connectWs, delay);
        };

        ws.onclose = scheduleReconnect;
        ws.onerror = () => {
          ws?.close();
        };
      } catch (e) {
        if (!isUnmounted) {
          const delay = Math.min(1000 * Math.pow(1.5, retryAttempt), 20000);
          retryAttempt++;
          reconnectTimeout = setTimeout(connectWs, delay);
        }
      }
    };

    connectWs();

    return () => {
      isUnmounted = true;
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [soundMuted]);

  // Telemetry Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => {
        if (vehicle.status !== "moving") return vehicle;

        const currentLat = vehicle.coords[0];
        const currentLng = vehicle.coords[1];
        const rad = (vehicle.heading * Math.PI) / 180;
        const deltaLat = Math.cos(rad) * 0.0004;
        const deltaLng = Math.sin(rad) * 0.0004;
        const newCoords = [currentLat + deltaLat, currentLng + deltaLng];

        const headingJitter = (Math.random() - 0.5) * 12;
        const newHeading = (vehicle.heading + headingJitter + 360) % 360;

        const speedJitter = (Math.random() - 0.5) * 4;
        const newSpeed = Math.max(15, Math.min(125, Math.round(vehicle.speed + speedJitter)));

        // Check overspeed against alert rules
        const overspeedRule = alertRules.find(r => r.type === "overspeed" && r.enabled);
        if (overspeedRule && newSpeed > Number(overspeedRule.parameter) && Math.random() < 0.08) {
          const alertId = `evt-${Date.now()}`;
          const newAlert = {
            id: alertId,
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            type: "overspeed",
            severity: "critical",
            message: `تجاوزت ${vehicle.name} السرعة المحددة (${newSpeed} كم/س)`,
            messageEn: `${vehicle.name} exceeded speed limit (${newSpeed} km/h)`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timeEn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            coords: newCoords,
            read: false
          };
          setEvents(ePrev => [newAlert, ...ePrev.slice(0, 40)]);
          if (!soundMuted && overspeedRule.channels.sound) soundFX.playAlert();
        }

        return {
          ...vehicle,
          coords: newCoords,
          heading: Math.round(newHeading),
          speed: newSpeed,
          odometer: vehicle.odometer + 0.015,
          historyPath: [...(vehicle.historyPath || []), newCoords]
        };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, soundMuted, alertRules]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const handleToggleVisibility = (vehicleId) => {
    setVisibleVehicleIds(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleCenterVehicle = (vehicle) => {
    if (!vehicle || !vehicle.coords) return;
    setCenterTarget({ coords: vehicle.coords, timestamp: Date.now() });
    setSelectedVehicleId(vehicle.id);
  };

  const handleOpenCommandModal = (vehicle, commandType = "immobilize") => {
    setCommandTargetVehicle(vehicle);
    setDefaultCommandType(commandType);
    setShowCommandsModal(true);
  };

  const handleCommandSuccess = (vehicleId, command) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        if (command === "immobilize") {
          return { ...v, status: "stopped", ignition: false, speed: 0 };
        } else if (command === "restore") {
          return { ...v, ignition: true };
        }
      }
      return v;
    }));

    const vName = vehicles.find(v => v.id === vehicleId)?.name || "المركبة";
    const newAlert = {
      id: `evt-${Date.now()}`,
      vehicleId,
      vehicleName: vName,
      type: "command_ack",
      severity: "info",
      message: `تم تنفيذ أمر (${command}) على ${vName} بنجاح عبر بروتوكول Traccar`,
      messageEn: `Command (${command}) executed on ${vName} successfully`,
      time: "الآن",
      timeEn: "Just now",
      coords: selectedVehicle?.coords,
      read: false
    };
    setEvents(prev => [newAlert, ...prev]);
  };

  const handleStartPlayback = (vehicle) => {
    setPlaybackVehicle(vehicle);
    setPlaybackPosition(vehicle.historyPath ? vehicle.historyPath[0] : null);
    if (vehicle.coords) {
      setCenterTarget({ coords: vehicle.coords, timestamp: Date.now() });
    }
  };

  const handleClosePlayback = () => {
    setPlaybackVehicle(null);
    setPlaybackPosition(null);
  };

  const handleSaveGeofence = async (newZone) => {
    setGeofences(prev => [newZone, ...prev]);
    if (newZone.coords) {
      setCenterTarget({ coords: newZone.coords, timestamp: Date.now() });
    }
    try {
      await fetch(API_ENDPOINTS.geofences, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(newZone)
      });
    } catch (e) {
      console.warn("[PostgreSQL] Error saving geofence:", e.message);
    }
  };

  const handleSavePolygon = async (points) => {
    const defaultName = lang === "ar" ? `منطقة مضلعة ${geofences.length + 1}` : `Polygon Zone ${geofences.length + 1}`;
    const name = window.prompt(lang === "ar" ? "أدخل اسم المنطقة المضلعة الجديدة:" : "Enter name for this polygon zone:", defaultName);
    if (!name) {
      setIsDrawingPolygon(false);
      return;
    }

    const newZone = {
      id: `zone-poly-${Date.now()}`,
      name: name.trim(),
      type: "polygon",
      polygonPoints: points,
      color: "#00b4c6",
      fillColor: "rgba(0, 180, 198, 0.22)",
      activeVehicles: 0
    };

    setGeofences(prev => [newZone, ...prev]);
    setIsDrawingPolygon(false);
    soundFX.playAlert();

    try {
      await fetch(API_ENDPOINTS.geofences, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(newZone)
      });
    } catch (e) {
      console.warn("[PostgreSQL] Error saving polygon geofence:", e.message);
    }
  };

  const handleAddVehicle = async (newVehicle) => {
    setVehicles(prev => [newVehicle, ...prev]);
    setVisibleVehicleIds(prev => [newVehicle.id, ...prev]);
    setSelectedVehicleId(newVehicle.id);
    setCenterTarget({ coords: newVehicle.coords, timestamp: Date.now() });

    try {
      await fetch(API_ENDPOINTS.devices, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(newVehicle)
      });
      // Re-sync to reflect live database updates
      syncPostgreSQLFleet(authToken, currentUser);
    } catch (e) {
      console.warn("[PostgreSQL] Error saving device:", e.message);
    }

    const newAlert = {
      id: `evt-${Date.now()}`,
      vehicleId: newVehicle.id,
      vehicleName: newVehicle.name,
      type: "device_connected",
      severity: "info",
      message: `تم ربط جهاز تعقب جديد وحفظه في PostgreSQL: ${newVehicle.name} (IMEI: ${newVehicle.imei}) عبر المنفذ ${newVehicle.protocolPort}`,
      messageEn: `New tracker connected and saved to PostgreSQL: ${newVehicle.name} (IMEI: ${newVehicle.imei}) on Port ${newVehicle.protocolPort}`,
      time: "الآن",
      timeEn: "Just now",
      coords: newVehicle.coords,
      read: false
    };
    setEvents(prev => [newAlert, ...prev]);
  };

  const handleSaveEditedVehicle = async (updatedVehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    try {
      await fetch(API_ENDPOINTS.devices, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(updatedVehicle)
      });
      syncPostgreSQLFleet(authToken, currentUser);
    } catch (e) {
      console.warn("[PostgreSQL] Error updating device:", e.message);
    }
  };

  const handleImpersonateClient = (client) => {
    setCurrentUser(client);
    setShowAdminPortalModal(false);
    alert(lang === "ar" ? `تم تسجيل الدخول بنجاح كعميل: ${client.name}` : `Logged in as client: ${client.name}`);
  };

  // If user is not authenticated, render the dedicated standalone full-screen LoginPage
  if (!authToken || !currentUser) {
    return (
      <LoginPage
        lang={lang}
        setLang={setLang}
        onLoginSuccess={handleLoginSuccess}
        justLoggedOut={justLoggedOut}
      />
    );
  }

  // If SuperAdmin opened Administration View (Full Official GPSWOX Admin matching user screenshots)
  if (viewMode === "admin" && currentUser?.role === "superadmin") {
    return (
      <Suspense fallback={<ModalLoadingFallback />}>
        <OfficialAdminPortal
          lang={lang}
          setLang={setLang}
          currentUser={currentUser}
          onLogout={handleLogout}
          onBackToMap={() => setViewMode("map")}
          vehicles={vehicles}
          setVehicles={setVehicles}
          clients={clients}
          setClients={setClients}
          onSyncPostgreSQL={() => syncPostgreSQLFleet(authToken, currentUser)}
        />
      </Suspense>
    );
  }

  return (
    <div className={`gps-app-root layout-${lang}`}>
      {/* Main Workspace: Sidebar + Map Canvas + Floating Elements */}
      <div className="gps-main-container">
        {/* Official GPSWOX Left Navigation Bar */}
        <OfficialSidebar
          lang={lang}
          setLang={setLang}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAdmin={() => {
            if (currentUser?.role !== "superadmin") {
              alert(lang === "ar" ? "هذا القسم مخصص لإدارة المنظومة (SuperAdmin) فقط" : "Restricted to SuperAdmin only");
              return;
            }
            setViewMode("admin");
          }}
          onOpenResellerPortal={() => setShowResellerPortalModal(true)}
          onOpenFleetDrivers={() => setShowFleetDriversModal(true)}
          onOpenAlerts={() => setShowAlertsModal(true)}
          onOpenHistory={() => setShowHistoryModal(true)}
          onOpenReports={() => setShowReportsModal(true)}
          onOpenCommands={() => {
            const v = vehicles.find(item => item.id === selectedVehicleId) || vehicles[0];
            handleOpenCommandModal(v);
          }}
          onOpenCamera={() => setShowCameraModal(true)}
          onOpenShare={() => setShowSharingModal(true)}
          onOpenAddDevice={() => setShowAddDeviceModal(true)}
          onOpenMaintenance={() => setShowMaintenanceModal(true)}
          onOpenExpenses={() => setShowExpensesModal(true)}
          onOpenTemplates={() => setShowTemplatesModal(true)}
          onOpenAccount={() => setShowAccountModal(true)}
          onOpenTraccarHub={() => setShowTraccarHubModal(true)}
          onOpenHelp={() => {
            setHelpInitialTab("guide");
            setShowHelpModal(true);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onSwitchAccount={handleLogout}
        />

        {/* Center Map Viewport */}
        <main className="gps-map-viewport">
          <MapView
            lang={lang}
            t={t}
            theme="light"
            vehicles={vehicles}
            visibleVehicleIds={visibleVehicleIds}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
            geofences={geofences}
            centerTarget={centerTarget}
            followVehicleId={followVehicleId}
            playbackRoute={playbackVehicle ? playbackVehicle.historyPath : null}
            playbackPosition={playbackPosition}
            mapAction={mapAction}
            activeLayerKey={activeLayerKey}
            onChangeLayer={(key) => setActiveLayerKey(key)}
            isRulerActive={isRulerActive}
            isDrawingPolygon={isDrawingPolygon}
            onSavePolygon={handleSavePolygon}
            onCancelDrawingPolygon={() => setIsDrawingPolygon(false)}
            snapToRoads={snapToRoads}
          />

          {/* Floating Objects Panel (السيارات) */}
          <OfficialObjectsPanel
            lang={lang}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(id) => {
              setSelectedVehicleId(id);
              const v = vehicles.find(item => item.id === id);
              if (v) handleCenterVehicle(v);
            }}
            visibleVehicleIds={visibleVehicleIds}
            onToggleVisibility={handleToggleVisibility}
            onToggleAllVisibility={(selectAll) => setVisibleVehicleIds(selectAll ? vehicles.map(v => v.id) : [])}
            onOpenAddDevice={() => {
              if (currentUser?.role !== "superadmin") {
                soundFX.playOverspeed();
                alert(lang === "ar" ? "إضافة أجهزة تعقب جديدة تتطلب ترخيصاً من إدارة المنظومة (Admin)." : "Adding trackers is restricted to SuperAdmin.");
                return;
              }
              setShowAddDeviceModal(true);
            }}
            currentUser={currentUser}
            onOpenCommands={(v) => handleOpenCommandModal(v)}
            onOpenSensors={(v) => {
              setSensorsTargetVehicle(v);
              setShowSensorsModal(true);
            }}
            onOpenEditDevice={(v) => {
              setEditTargetVehicle(v);
              setShowEditDeviceModal(true);
            }}
            onOpenHistory={(v) => {
              setSelectedVehicleId(v.id);
              setShowHistoryModal(true);
            }}
            onOpenShare={(v) => {
              setSelectedVehicleId(v.id);
              setShowSharingModal(true);
            }}
            onOpenExpenses={(v) => {
              setSelectedVehicleId(v.id);
              setShowExpensesModal(true);
            }}
            onOpenCamera={(v) => {
              setSelectedVehicleId(v.id);
              setShowCameraModal(true);
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Floating Bottom Telemetry Dock (4 Modular Cards) */}
          {selectedVehicle && !playbackVehicle && (
            <OfficialBottomDock
              lang={lang}
              vehicle={selectedVehicle}
              onOpenMaintenance={() => setShowMaintenanceModal(true)}
              onOpenSensors={() => {
                setSensorsTargetVehicle(selectedVehicle);
                setShowSensorsModal(true);
              }}
              onOpenCamera={() => setShowCameraModal(true)}
              onCenterMap={() => handleCenterVehicle(selectedVehicle)}
            />
          )}

          {/* Floating Right Map Toolbar */}
          <OfficialMapToolbar
            lang={lang}
            onFitBounds={() => setMapAction({ type: "fitAll", timestamp: Date.now() })}
            onZoomIn={() => setMapAction({ type: "zoomIn", timestamp: Date.now() })}
            onZoomOut={() => setMapAction({ type: "zoomOut", timestamp: Date.now() })}
            onOpenGeofences={() => setShowGeofenceModal(true)}
            activeLayerKey={activeLayerKey}
            onChangeLayer={(key) => setActiveLayerKey(key)}
            onToggleRuler={() => setIsRulerActive(!isRulerActive)}
            isRulerActive={isRulerActive}
            isDrawingPolygon={isDrawingPolygon}
            onToggleDrawPolygon={() => setIsDrawingPolygon(!isDrawingPolygon)}
            snapToRoads={snapToRoads}
            onToggleSnapToRoads={() => setSnapToRoads(prev => !prev)}
          />

          {/* History Route Playback HUD */}
          {playbackVehicle && (
            <HistoryPlayer
              lang={lang}
              t={t}
              vehicle={playbackVehicle}
              onClose={handleClosePlayback}
              onPlaybackUpdate={(pt) => setPlaybackPosition(pt)}
              snapToRoads={snapToRoads}
              onToggleSnapToRoads={() => setSnapToRoads(prev => !prev)}
            />
          )}
        </main>
      </div>

      {/* 3. Comprehensive Modals Layer (Code-Split with Suspense) */}
      <Suspense fallback={<ModalLoadingFallback />}>
        {/* Admin Portal Modal */}
        {showAdminPortalModal && currentUser?.role === "superadmin" && (
        <AdminPortalModal
          lang={lang}
          onClose={() => setShowAdminPortalModal(false)}
          clients={clients}
          setClients={setClients}
          vehicles={vehicles}
          onImpersonateClient={handleImpersonateClient}
          currentUser={currentUser}
        />
      )}

      {/* Reseller Portal Modal */}
      {showResellerPortalModal && (
        <ResellerPortalModal
          lang={lang}
          currentUser={currentUser}
          clients={clients}
          setClients={setClients}
          vehicles={vehicles}
          setVehicles={setVehicles}
          onClose={() => setShowResellerPortalModal(false)}
        />
      )}

      {/* Fleet Drivers Modal */}
      {showFleetDriversModal && (
        <FleetDriversModal
          lang={lang}
          currentUser={currentUser}
          vehicles={vehicles}
          setVehicles={setVehicles}
          clients={clients}
          setClients={setClients}
          onClose={() => setShowFleetDriversModal(false)}
        />
      )}

      {/* Alerts & Rules Engine Modal */}
      {showAlertsModal && (
        <AlertsModal
          lang={lang}
          onClose={() => setShowAlertsModal(false)}
          events={events}
          setEvents={setEvents}
          alertRules={alertRules}
          setAlertRules={setAlertRules}
          vehicles={vehicles}
          soundMuted={soundMuted}
          setSoundMuted={setSoundMuted}
        />
      )}

      {/* Route History & Drive Log Modal */}
      {showHistoryModal && (
        <HistoryModal
          lang={lang}
          onClose={() => setShowHistoryModal(false)}
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onStartPlayback={handleStartPlayback}
          snapToRoads={snapToRoads}
          onToggleSnapToRoads={() => setSnapToRoads(prev => !prev)}
        />
      )}

      {/* Reports Center Modal */}
      {showReportsModal && (
        <ReportsModal
          lang={lang}
          t={t}
          vehicles={vehicles}
          onClose={() => setShowReportsModal(false)}
        />
      )}

      {/* Commands Center Modal */}
      {showCommandsModal && commandTargetVehicle && (
        <CommandsModal
          lang={lang}
          t={t}
          vehicle={commandTargetVehicle}
          defaultCommand={defaultCommandType}
          currentUser={currentUser}
          onClose={() => setShowCommandsModal(false)}
          onCommandSuccess={handleCommandSuccess}
        />
      )}

      {/* Dashcam Live & Media Modal */}
      {showCameraModal && (
        <CameraMediaModal
          lang={lang}
          onClose={() => setShowCameraModal(false)}
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
        />
      )}

      {/* Live Location Sharing Addon Modal */}
      {showSharingModal && (
        <SharingModal
          lang={lang}
          onClose={() => setShowSharingModal(false)}
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
        />
      )}

      {/* Geofences & Zones Modal */}
      {showGeofenceModal && (
        <GeofenceModal
          lang={lang}
          t={t}
          defaultCoords={selectedVehicle?.coords || [24.7136, 46.6753]}
          onClose={() => setShowGeofenceModal(false)}
          onSaveGeofence={handleSaveGeofence}
          onStartDrawingPolygon={() => setIsDrawingPolygon(true)}
        />
      )}

      {/* Hardware Tracker & APN Wizard Modal */}
      {showAddDeviceModal && (
        <AddDeviceModal
          lang={lang}
          t={t}
          onClose={() => setShowAddDeviceModal(false)}
          onAddVehicle={handleAddVehicle}
          serverIp="gps.yourcompany-fleet.com"
        />
      )}

      {/* Maintenance Scheduler Modal */}
      {showMaintenanceModal && (
        <MaintenanceModal
          lang={lang}
          t={t}
          vehicles={vehicles}
          onClose={() => setShowMaintenanceModal(false)}
        />
      )}

      {/* Fleet Expenses & Fuel Ledger Modal */}
      {showExpensesModal && (
        <ExpensesModal
          lang={lang}
          onClose={() => setShowExpensesModal(false)}
          expenses={expenses}
          setExpenses={setExpenses}
          vehicles={vehicles}
        />
      )}

      {/* Templates Center Modal */}
      {showTemplatesModal && (
        <TemplatesModal
          lang={lang}
          onClose={() => setShowTemplatesModal(false)}
        />
      )}

      {/* Account Settings & Preferences Modal */}
      {showAccountModal && (
        <AccountModal
          lang={lang}
          onClose={() => setShowAccountModal(false)}
          currentUser={currentUser}
          onUpdateUser={(updated) => setCurrentUser(updated)}
        />
      )}

      {/* Help, Guide & Upgrade Plans Modal */}
      {showHelpModal && (
        <HelpGuideModal
          lang={lang}
          initialTab={helpInitialTab}
          onClose={() => setShowHelpModal(false)}
          onOpenAddDevice={() => setShowAddDeviceModal(true)}
        />
      )}

      {/* Edit Vehicle Metadata Modal */}
      {showEditDeviceModal && editTargetVehicle && (
        <EditDeviceModal
          lang={lang}
          vehicle={editTargetVehicle}
          currentUser={currentUser}
          onClose={() => setShowEditDeviceModal(false)}
          onSaveVehicle={handleSaveEditedVehicle}
        />
      )}

      {/* Sensors Calibration Modal */}
      {showSensorsModal && (
        <SensorsModal
          lang={lang}
          vehicles={vehicles}
          selectedVehicleId={sensorsTargetVehicle?.id || selectedVehicleId}
          onClose={() => setShowSensorsModal(false)}
        />
      )}

      {/* Traccar Gateway Protocol Hub Modal */}
      {showTraccarHubModal && (
        <TraccarHubModal
          lang={lang}
          t={t}
          onClose={() => setShowTraccarHubModal(false)}
          isGatewayConnected={isGatewayConnected}
          vehicles={vehicles}
        />
      )}
      </Suspense>
    </div>
  );
}

export default App;
