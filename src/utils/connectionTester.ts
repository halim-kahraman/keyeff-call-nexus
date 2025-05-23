
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
      // Validate required fields before sending the request
      if (!validateSettings(settings)) {
        throw new Error("Bitte füllen Sie alle erforderlichen Felder aus.");
      }
      
      const response = await testFn(settings);
      
      if (!response.success) {
        throw new Error(response.message || "Verbindungstest fehlgeschlagen");
      }
      
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

// Validate settings object for required fields
const validateSettings = (settings: ConnectionSettings): boolean => {
  // Check if any value is empty string
  const hasEmptyValues = Object.values(settings).some(
    value => value === "" || value === undefined || value === null
  );
  
  // Exclude password fields with placeholder value
  const hasInvalidPasswords = Object.entries(settings).some(
    ([key, value]) => key.includes("password") && value === "********"
  );
  
  return !hasEmptyValues && !hasInvalidPasswords;
};

export const connectionTester = {
  testSipConnection: createTestFunction(
    settingsService.testSipConnection,
    "SIP-Verbindung erfolgreich getestet",
    "SIP-Verbindung fehlgeschlagen"
  ),
  
  testVpnConnection: createTestFunction(
    settingsService.testVpnConnection,
    "VPN-Verbindung erfolgreich getestet",
    "VPN-Verbindung fehlgeschlagen"
  ),
  
  testFritzboxConnection: createTestFunction(
    settingsService.testFritzboxConnection,
    "FRITZ!Box-Verbindung erfolgreich getestet",
    "FRITZ!Box-Verbindung fehlgeschlagen"
  ),
  
  testEmailConnection: createTestFunction(
    settingsService.testEmailConnection,
    "E-Mail-Verbindung erfolgreich getestet",
    "E-Mail-Verbindung fehlgeschlagen"
  ),
  
  testKeyEffApiConnection: createTestFunction(
    settingsService.testKeyEffApiConnection,
    "KeyEff API-Verbindung erfolgreich getestet",
    "KeyEff API-Verbindung fehlgeschlagen"
  )
};
