import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useInterval } from '../../hooks/useInterval';
import api from '../../api/axios';
import type { Trip } from '../../types';

export const DriverDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const fetchDriverData = async () => {
    try {
      const myTripsRes = await api.get('/trips/my');
      const myTrips: Trip[] = myTripsRes.data || [];
      
      const active = myTrips.find(t => t.status === 'IN_PROGRESS');
      
      if (active) {
        setActiveTrip(active);
        setAvailableTrips([]);
      } else {
        setActiveTrip(null);
        const pendingRes = await api.get('/trips/pending');
        setAvailableTrips(pendingRes.data || []);
      }
    } catch (err) {
      console.error('Error al sincronizar datos', err);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  useInterval(() => {
    fetchDriverData();
  }, 4000);

  const handleAcceptTrip = async (tripId: number) => {
    setError('');
    setLoadingId(tripId);
    try {
      const response = await api.patch(`/trips/${tripId}/accept`);
      setActiveTrip(response.data);
      setAvailableTrips([]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo aceptar el viaje.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeTrip) return;
    setError('');
    try {
      // 💡 Corregido a método PATCH oficial
      await api.patch(`/trips/${activeTrip.id}/complete`);
      setActiveTrip(null);
      fetchDriverData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al completar el viaje');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Hola, {user?.firstName} 🚗</h2>
          <small style={{ color: '#666' }}>Conductor Verificado</small>
        </div>
        <button onClick={logout} style={{ padding: '8px 12px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>

      {error && <p style={{ color: 'red', padding: '10px', background: '#fff0f0', borderRadius: '4px' }}>{error}</p>}

      {activeTrip ? (
        <div style={{ border: '2px solid #2ecc71', padding: '25px', borderRadius: '8px', background: '#fff' }}>
          <h3>Viaje en Progreso</h3>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <p>📍 <strong>Recoger en:</strong> {activeTrip.pickupAddress}</p>
            <p>🏁 <strong>Llevar a:</strong> {activeTrip.dropoffAddress}</p>
          </div>
          <button onClick={handleCompleteTrip} style={{ width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            🏁 Marcar como Completado
          </button>
        </div>
      ) : (
        <div>
          <h3>Solicitudes Disponibles</h3>
          {availableTrips.length === 0 ? (
            <p style={{ color: '#777', textAlign: 'center', padding: '20px' }}>🔄 Esperando nuevos viajes en la zona...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {availableTrips.map((trip) => (
                <div key={trip.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '5px 0' }}>📍 <strong>Origen:</strong> {trip.pickupAddress}</p>
                    <p style={{ margin: '5px 0' }}>🏁 <strong>Destino:</strong> {trip.dropoffAddress}</p>
                  </div>
                  <button onClick={() => handleAcceptTrip(trip.id)} disabled={loadingId !== null} style={{ padding: '10px 16px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Aceptar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};