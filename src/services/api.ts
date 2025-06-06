
// Main API exports - direct re-exports to avoid circular dependencies
export { authService } from './api/authService';
export { customerService } from './api/customerService';
export { campaignService } from './api/campaignService';
export { settingsService } from './api/settingsService';
export { filialeService } from './api/filialeService';
export { statisticsService } from './api/statisticsService';
export { connectionService } from './api/connectionService';
export { userService } from './api/userService';
export { logsService } from './api/logsService';
export { dashboardService } from './api/dashboardService';
export { adminService } from './api/adminService';
export { appointmentService } from './api/appointmentService';

// Export the main API instance as default
export { default as api } from './api/config';
