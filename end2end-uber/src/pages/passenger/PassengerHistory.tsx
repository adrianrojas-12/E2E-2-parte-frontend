import { useState, useEffect } from 'react';
import api from '../../api/axios';

export const PassengerHistory = () => {
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPassengerHistory = async () => {
      try {
        const response = await api.get('/trips/my');
        // Filtramos para mostrar los viajes terminados del pasajero
        const completed = (response.data || []).filter((t: any) => t.status === 'COMPLETED');
        setMyTrips(completed);
      } catch (err: any) {
        setError('No se pudo obtener tu historial de viajes.');
      } finally {
        setLoading(false);
      }
    };

    fetchPassengerHistory();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🧳 Mis Viajes Pasados (Pasajero)</h2>

      {loading && <p>Buscando tus viajes anteriores...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && myTrips.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No has realizado viajes todavía. ¡Pide tu primer Uber en el mapa!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {myTrips.map((trip: any) => (
            <div key={trip.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '13px' }}>
                <span>ID Servicio: #{trip.id}</span>
                <span style={{ color: 'green', fontWeight: 'bold' }}>Terminado</span>
              </div>
              <div style={{ margin: '10px 0' }}>
                <p style={{ margin: '4px 0' }}>🛫 <strong>Salida:</strong> {trip.pickupAddress}</p>
                <p style={{ margin: '4px 0' }}>🛬 <strong>Llegada:</strong> {trip.dropoffAddress}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', background: '#eee', padding: '8px', borderRadius: '4px' }}>
                <span>👨‍✈️ Conductor: {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'Asignado'}</span>
                <strong>Monto: ${trip.price}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};