import { Navigate } from 'react-router-dom';

/**
 * STUB: Member 1's ProtectedRoute
 * In the real app, this will check the auth context/JWT.
 * For Phase 1, we just render the children to allow UI testing.
 */
export default function ProtectedRoute({ children }) {
    // const { isAuthenticated } = useAuth(); // implementation by Member 1
    const isAuthenticated = true; // Hardcoded for Phase 1 Member 3 testing

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
