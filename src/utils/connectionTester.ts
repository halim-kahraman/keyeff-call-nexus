
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
      // Only validate real settings, not demo placeholders
      if (containsOnlyPlaceholders(settings)) {
        // For demo purposes, simulate success if using placeholder data
        toast.success("Demo-Verbindungstest erfolgreich", {
          description: "Im Produktivmodus würde eine echte Verbindung getestet werden."
        });
        
        return {
          success: true,
          message: successMessage,
          details: { demo: true, message: "Demo-Test erfolgreich" }
        };
      }
      
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

// Check if settings contain only placeholder values (for demo purposes)
const containsOnlyPlaceholders = (settings: ConnectionSettings): boolean => {
  const placeholderPatterns = [
    /\*+/,                    // ******
    /<[^>]+>/,                // <placeholder>
    /\{\{[^}]+\}\}/,          // {{placeholder}}
    /^demo.*/i,               // demo...
    /^placeholder.*/i,        // placeholder...
    /^example.*/i,            // example...
    /^test.*/i,               // test...
    /^(192\.168\.1\.\d+)$/    // Common local IP
  ];
  
  // Check if all values match a placeholder pattern
  return Object.values(settings).every(value => {
    if (!value) return true; // Empty values are treated as placeholders
    
    // Check if value matches any of the placeholder patterns
    return placeholderPatterns.some(pattern => pattern.test(value));
  });
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
