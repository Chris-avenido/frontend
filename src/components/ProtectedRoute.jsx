import { Navigate, Outlet } from 'react-router-dom';
import { getSessionUser, isAllowedRole } from '../utils/authSession';

const ProtectedRoute = () => {
  const user = getSessionUser();

  if (!user || !isAllowedRole(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
