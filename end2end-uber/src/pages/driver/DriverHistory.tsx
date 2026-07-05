import { useState, useEffect } from 'react';
import api from '../../api/axios';
import type { Trip } from '../../types'; // Ajusta la ruta según tus types

export const DriverHistory = () => {
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/trips/my');
        // Filtramos solo los viajes finalizados
        const completed = (response.data || []).filter((t: any) => t.status === 'COMPLETED');
        setPastTrips(completed);
      } catch (err: any) {
        setError('No se pudo cargar el historial de viajes.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📊 Historial de Viajes (Conductor)</h2>
      
      {loading && <p>Cargando historial...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && pastTrips.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Aún no has completado ningún viaje como conductor.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {pastTrips.map((trip: any) => (
            <div key={trip.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#f9f9f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '13px' }}>
                <span>Viaje #{trip.id}</span>
                <span>💰 Ganancia: ${trip.price || '0.00'}</span>
              </div>
              <div style={{ margin: '10px 0' }}>
                <p style={{ margin: '4px 0' }}>📍 <strong>Origen:</strong> {trip.pickupAddress}</p>
                <p style={{ margin: '4px 0' }}>🏁 <strong>Destino:</strong> {trip.dropoffAddress}</p>
              </div>
              {trip.passengerRating && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ccc', color: '#f1c40f' }}>
                  ⭐ <strong>Calificación:</strong> {trip.passengerRating} / 5
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};