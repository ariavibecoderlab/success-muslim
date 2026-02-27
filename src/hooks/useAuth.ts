// Re-export from AuthContext for backward compatibility.
// All 35+ files importing useAuth continue to work with zero changes.
export { useAuthContext as useAuth } from '@/contexts/AuthContext';
