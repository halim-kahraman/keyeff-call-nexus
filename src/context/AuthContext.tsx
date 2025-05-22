
import React from "react";
import { AuthProvider } from "./providers/AuthProvider";
import { useAuth } from "./hooks/useAuth";

// Re-export everything from the new files
export { AuthProvider, useAuth };
export type { User, UserRole, PasswordResetResponse } from "./types/auth.types";
