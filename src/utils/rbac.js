/**
 * Role-Based Access Control (RBAC) & Multi-Tenant Data Scoping Engine
 * GPSWOX Enterprise Fleet Platform
 */

export const ROLES = {
  SUPERADMIN: "superadmin",
  RESELLER: "reseller",
  COMPANY: "company",
  INDIVIDUAL: "individual",
  DRIVER: "driver"
};

/**
 * Filter vehicles strictly based on user role and hierarchy
 * @param {Array} allVehicles 
 * @param {Object} user 
 * @returns {Array} authorized vehicles
 */
export function getAuthorizedVehicles(allVehicles = [], user = null) {
  if (!user || !Array.isArray(allVehicles)) return [];

  const role = user.role || "individual";

  // 1. SuperAdmin: Absolute access to all fleet objects
  if (role === ROLES.SUPERADMIN || role === "admin") {
    return allVehicles;
  }

  // 2. Reseller: Access to vehicles belonging to their clients and distributed stock
  if (role === ROLES.RESELLER) {
    return allVehicles.filter(v => 
      Boolean(user.id && (v.resellerId === user.id || v.clientId === user.id)) || 
      Boolean(Array.isArray(user.clientIds) && user.clientIds.includes(v.clientId))
    );
  }

  // 3. Company / Fleet: Access to vehicles belonging to this company's fleet
  if (role === ROLES.COMPANY || role === "client") {
    return allVehicles.filter(v => 
      Boolean(user.id && (v.clientId === user.id || v.companyId === user.id)) || 
      Boolean(user.company && v.company && v.company === user.company)
    );
  }

  // 4. Individual: Access ONLY to their own private vehicle(s) - Guarded against undefined === undefined
  if (role === ROLES.INDIVIDUAL) {
    return allVehicles.filter(v => 
      Boolean(user.id && (v.clientId === user.id || v.ownerId === user.id)) || 
      Boolean(user.assignedVehicleId && v.id === user.assignedVehicleId) || 
      Boolean(user.assignedImei && v.imei && v.imei === user.assignedImei)
    );
  }

  // 5. Driver: Access ONLY to their single assigned vehicle (Vehicle-locked read-only)
  if (role === ROLES.DRIVER) {
    return allVehicles.filter(v => 
      Boolean(user.assignedVehicleId && v.id === user.assignedVehicleId) || 
      Boolean(user.id && v.driverId === user.id) || 
      Boolean(user.name && v.driver && v.driver.name === user.name)
    );
  }

  // Fallback for default client
  return allVehicles.filter(v => Boolean(user.id && v.clientId === user.id));
}

/**
 * Filter clients/sub-accounts based on user role
 * @param {Array} allClients 
 * @param {Object} user 
 * @returns {Array} authorized clients
 */
export function getAuthorizedClients(allClients = [], user = null) {
  if (!user || !Array.isArray(allClients)) return [];

  const role = user.role || "individual";

  if (role === ROLES.SUPERADMIN || role === "admin") {
    return allClients;
  }

  if (role === ROLES.RESELLER) {
    // Reseller sees only their own created clients (companies and individuals)
    return allClients.filter(c => c.resellerId === user.id);
  }

  if (role === ROLES.COMPANY) {
    // Company sees only drivers belonging to this company
    return allClients.filter(c => c.companyId === user.id || c.role === ROLES.DRIVER);
  }

  return [];
}

/**
 * Check if user has permission for a specific action
 * @param {Object} user 
 * @param {String} action 
 * @returns {Boolean}
 */
export function canUserPerform(user, action) {
  if (!user) return false;
  const role = user.role || "individual";

  if (role === ROLES.SUPERADMIN || role === "admin") return true;

  switch (action) {
    case "access_superadmin_portal":
      return false;

    case "access_reseller_portal":
      return role === ROLES.RESELLER;

    case "access_driver_management":
      return role === ROLES.COMPANY || role === ROLES.RESELLER;

    case "add_new_device":
      return role === ROLES.RESELLER;

    case "edit_device_settings":
      return role === ROLES.RESELLER || role === ROLES.COMPANY || role === ROLES.INDIVIDUAL;

    case "send_immobilizer_cut_engine":
      // Blocked for drivers for safety reasons
      return role !== ROLES.DRIVER;

    case "send_basic_commands":
      return true;

    case "view_reports":
      return true; // Filtered to their vehicles

    case "view_history":
      return true;

    case "manage_maintenance":
      return role !== ROLES.DRIVER;

    case "manage_expenses":
      return role !== ROLES.DRIVER;

    default:
      return false;
  }
}

/**
 * Role display metadata helper
 */
export function getRoleBadgeInfo(role, lang = "ar") {
  switch (role) {
    case ROLES.SUPERADMIN:
    case "admin":
      return {
        label: lang === "ar" ? "مدير عام المنظومة" : "SuperAdmin",
        color: "#00b4c6",
        bg: "rgba(0, 180, 198, 0.15)",
        icon: "👑"
      };
    case ROLES.RESELLER:
      return {
        label: lang === "ar" ? "موزع معتمد" : "Authorized Reseller",
        color: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.15)",
        icon: "🏢"
      };
    case ROLES.COMPANY:
    case "client":
      return {
        label: lang === "ar" ? "شركة أسطول" : "Fleet Company",
        color: "#3b82f6",
        bg: "rgba(59, 130, 246, 0.15)",
        icon: "🚚"
      };
    case ROLES.INDIVIDUAL:
      return {
        label: lang === "ar" ? "مالك خاص (فرد)" : "Individual Owner",
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.15)",
        icon: "👤"
      };
    case ROLES.DRIVER:
      return {
        label: lang === "ar" ? "سائق أسطول" : "Fleet Driver",
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.15)",
        icon: "🚗"
      };
    default:
      return {
        label: lang === "ar" ? "مستخدم" : "User",
        color: "#94a3b8",
        bg: "rgba(148, 163, 184, 0.15)",
        icon: "•"
      };
  }
}
