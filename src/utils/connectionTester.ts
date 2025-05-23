
import { toast } from "sonner";
import { settingsService } from "@/services/api";

// Define types for connection tests
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface ConnectionSettings {
  [key: string]: string;
}

// Factory for creating connection test functions with unified error handling
const createTestFunction = (
  testFn: (settings: ConnectionSettings) => Promise<any>,
  successMessage: string,
  errorMessage: string
) => {
  return async (settings: ConnectionSettings): Promise<ConnectionTestResult> => {
    try {
      const response = await testFn(settings);
      
      // Show success toast
      toast.success(successMessage);
      
      return {
        success: true,
        message: successMessage,
        details: response
      };
    } catch (error: any) {
      // Get error details
      const details = error.response?.data || error;
      const message = error.message || errorMessage;
      
      // Show error toast
      toast.error(errorMessage, {
        description: message
      });
      
      return {
        success: false,
        message,
        details
      };
    }
  };
};

export const connectionTester = {
  testSipConnection: createTestFunction(
    settingsService.testSipConnection,
    "SIP-Verbindung erfolgreich",
    "SIP-Verbindung fehlgeschlagen"
  ),
  
  testVpnConnection: createTestFunction(
    settingsService.testVpnConnection,
    "VPN-Verbindung erfolgreich",
    "VPN-Verbindung fehlgeschlagen"
  ),
  
  testFritzboxConnection: createTestFunction(
    settingsService.testFritzboxConnection,
    "FRITZ!Box-Verbindung erfolgreich",
    "FRITZ!Box-Verbindung fehlgeschlagen"
  ),
  
  testEmailConnection: createTestFunction(
    settingsService.testEmailConnection,
    "E-Mail-Verbindung erfolgreich",
    "E-Mail-Verbindung fehlgeschlagen"
  ),
  
  testKeyEffApiConnection: createTestFunction(
    settingsService.testKeyEffApiConnection,
    "KeyEff API-Verbindung erfolgreich",
    "KeyEff API-Verbindung fehlgeschlagen"
  )
};
