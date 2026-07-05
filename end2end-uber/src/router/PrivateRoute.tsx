import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.JSX.Element;
  allowedRole: 'PASSENGER' | 'DRIVER';
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRole }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'PASSENGER' ? '/passenger' : '/driver'} replace />;
  }

  return children;
};