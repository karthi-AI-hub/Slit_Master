import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { Spinner } from "./Spinner";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Checking authentication..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
