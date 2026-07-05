import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { PassengerDashboard } from '../pages/passenger/PassengerDashboard';
import { PassengerHistory } from '../pages/passenger/PassengerHistory';
import { DriverDashboard } from '../pages/driver/DriverDashboard';
import { DriverHistory } from '../pages/driver/DriverHistory';
import { PrivateRoute } from './PrivateRoute';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas Protegidas del Pasajero */}
      <Route
        path="/passenger"
        element={
          <PrivateRoute allowedRole="PASSENGER">
            <PassengerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/passenger/history"
        element={
          <PrivateRoute allowedRole="PASSENGER">
            <PassengerHistory />
          </PrivateRoute>
        }
      />

      {/* Rutas Protegidas del Conductor */}
      <Route
        path="/driver"
        element={
          <PrivateRoute allowedRole="DRIVER">
            <DriverDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/driver/history"
        element={
          <PrivateRoute allowedRole="DRIVER">
            <DriverHistory />
          </PrivateRoute>
        }
      />

      {/* Comodín: Cualquier otra ruta te regresa al Login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};