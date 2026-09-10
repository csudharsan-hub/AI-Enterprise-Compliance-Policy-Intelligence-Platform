/**
 * RolePermissionWrapper
 * Renders children only if the current user's role has the given permission.
 * Frontend-only guard — backend is the source of truth.
 */
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../config/roleConfig';

const RolePermissionWrapper = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();
  const role = user?.roles?.[0];
  if (!hasPermission(role, permission)) return fallback;
  return children;
};

export default RolePermissionWrapper;
