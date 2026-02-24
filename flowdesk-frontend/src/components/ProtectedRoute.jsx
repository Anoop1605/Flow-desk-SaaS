import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute — FlowDesk Member 1
 * Wraps routes that require authentication to access.
 */
export default function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // 1. Show spinner while AuthContext validates the token on initial mount
    // WHY: Without this, a logged-in user who hits F5 might see a flash 
    //      of the login screen while the token verification API call is happening.
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-canvas">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    // 2. Not logged in? Redirect to /login
    // 'replace' prevents them from hitting the browser "Back" button to return here
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // 3. Logged in, but wrong role? (Phase 2 feature)
    if (requiredRole && user?.role !== requiredRole && user?.role !== 'SUPER_ADMIN') {
        // Technically this should be a 403 page, but redirecting to dashboard is fine for now
        return <Navigate to="/" replace />;
    }

    // 4. Authenticated and authorized -> Render the page
    return children;
}
