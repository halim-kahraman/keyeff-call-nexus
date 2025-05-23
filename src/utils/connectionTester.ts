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
      
      // Show testing toast
      const toastId = toast.loading("Verbindung wird getestet...");
      
      // Send test request
      const response = await testFn(settings);
      
      // Update toast based on response
      if (response.success) {
        toast.success(successMessage, {
          id: toastId,
          description: response.message
        });
      } else {
        toast.error(errorMessage, {
          id: toastId,
          description: response.message
        });
      }
      
      return {
        success: response.success,
        message: response.message,
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

// Check if settings object has valid values (not placeholder values)
const validateSettings = (settings: ConnectionSettings): boolean => {
  // Placeholder patterns
  const placeholderPatterns = [
    /^\*+$/,                     // ******
    /^<[^>]+>$/,                 // <placeholder>
    /^\{\{[^}]+\}\}$/,          // {{placeholder}}
    /^demo.*/i,                 // demo...
    /^placeholder.*/i,          // placeholder...
    /^example.*/i,              // example...
    /^test.*/i,                 // test...
  ];
  
  // Check all required fields
  const hasRequiredFields = Object.entries(settings).every(([key, value]) => {
    // Skip optional fields or fields with default values
    if (key.includes('enabled') || key.includes('timeout') || key.includes('encryption')) {
      return true;
    }

    // Skip password fields that might contain unchanged placeholder stars
    if (key.includes('password') && value === '********') {
      return true;
    }
    
    // Check if value is empty
    if (!value || value.trim() === '') {
      return false;
    }
    
    // Check if value looks like a placeholder
    for (const pattern of placeholderPatterns) {
      if (pattern.test(value)) {
        return false;
      }
    }
    
    return true;
  });
  
  return hasRequiredFields;
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
