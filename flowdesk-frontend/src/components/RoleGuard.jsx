/**
 * RoleGuard — Member 2
 * Conditionally renders children based on the logged-in user's role.
 * In Phase 1, the mock user has role 'ADMIN' so all guarded content shows.
 * Phase 2: will enforce real role checks from JWT claims.
 */
import { useAuth } from '../contexts/AuthContext';

export default function RoleGuard({ allowedRoles, children, fallback = null }) {
    const { user } = useAuth();

    // Check if user's role is in the allowed list
    const hasRole = user && allowedRoles.includes(user.role);

    if (!hasRole) {
        return fallback;
    }

    return children;
}
