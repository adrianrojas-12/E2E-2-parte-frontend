import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useInterval } from '../../hooks/useInterval';
import api from '../../api/axios';
import type { Trip } from '../../types';

interface AvailableDriver {
  id: number;
  firstName: string;
  lastName: string;
  rating: number;
}

export const PassengerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 📝 NUEVOS ESTADOS EXIGIDOS POR LA RÚBRICA:
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratedTripId, setRatedTripId] = useState<number | null>(null);

  // Traer el historial, buscar activos y traer conductores disponibles
  const fetchPassengerData = async () => {
    try {
      // 1. Obtener viajes (Rúbrica punto 2)
      const response = await api.get('/trips'); 
      const allTrips: Trip[] = response.data || [];
      setTrips(allTrips);

      // El viaje activo será el primero que esté PENDING o IN_PROGRESS
      const active = allTrips.find(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
      setCurrentTrip(active || null);

      // 2. Traer conductores disponibles para la rúbrica (Rúbrica punto 3)
      if (!active) {
        const driversResponse = await api.get('/drivers/available');
        setAvailableDrivers(driversResponse.data || []);
      }
    } catch (err) {
      console.error('Error al traer datos', err);
    }
  };

  useEffect(() => {
    fetchPassengerData();
  }, []);

  // Polling automático cada 4 segundos (Rúbrica punto 4)
  useInterval(() => {
    fetchPassengerData();
  }, currentTrip ? 4000 : null);

  const handleRequestTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/trips', {
        pickupAddress: pickup,
        dropoffAddress: dropoff,
      });
      setCurrentTrip(response.data);
      setPickup('');
      setDropoff('');
      fetchPassengerData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo solicitar el viaje');
    } finally {
      setLoading(false);
    }
  };

  // 📝 FUNCIÓN NUEVA: Enviar calificación al backend (Rúbrica punto 4)
  const handleRateTrip = async (tripId: number) => {
    try {
      await api.post(`/trips/${tripId}/rate`, {
        rating: rating,
        comment: comment
      });
      setRatedTripId(tripId); // Marcamos el viaje como calificado localmente
      setComment('');
      fetchPassengerData(); // Refrescamos la lista
      alert('¡Gracias por tu calificación!');
    } catch (err) {
      alert('No se pudo enviar la calificación');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Hola, {user?.firstName} 👋</h2>
          <small style={{ color: '#666' }}>Pasajero</small>
        </div>
        <button onClick={logout} style={{ padding: '8px 12px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>

      {error && <p style={{ color: 'red', padding: '10px', background: '#fff0f0', borderRadius: '4px' }}>{error}</p>}

      {/* COMPONENTE 1: FORMULARIO DE SOLICITUD + CONDUCTORES DISPONIBLES */}
      {!currentTrip ? (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: '#f9f9f9', marginBottom: '20px' }}>
          <h3>¿A dónde vamos hoy?</h3>
          
          {/* 🚗 RÚBRICA PUNTO 3: Mostrar conductores disponibles antes de confirmar */}
          <div style={{ marginBottom: '15px', padding: '10px', background: '#eef8ff', borderRadius: '6px', border: '1px solid #bce0ff' }}>
            <strong>🚖 Conductores libres cerca:</strong> {availableDrivers.length === 0 ? ' Buscando...' : ''}
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', fontSize: '13px' }}>
              {availableDrivers.slice(0, 3).map(driver => (
                <li key={driver.id}>
                  {driver.firstName} {driver.lastName} (⭐ {driver.rating || '5.0'})
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleRequestTrip} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <strong>Punto de Partida:</strong>
              <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Ej: Av. Javier Prado 123" required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <strong>Destino Final:</strong>
              <input type="text" value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Ej: Centro Comercial Larcomar" required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </label>
            <button type="submit" disabled={loading} style={{ padding: '12px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Buscando Conductor...' : 'Solicitar Uber'}
            </button>
          </form>
        </div>
      ) : (
        /* COMPONENTE 2: VIAJE ACTIVO CON DETALLES */
        <div style={{ border: '2px solid black', padding: '25px', borderRadius: '8px', background: '#fff', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Tu Viaje Activo</h3>
            <span style={{
              padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px',
              background: currentTrip.status === 'PENDING' ? '#f39c12' : '#2ecc71', color: 'white'
            }}>
              {currentTrip.status === 'PENDING' ? 'Buscando Chofer' : 'En Camino'}
            </span>
          </div>
          <p>📍 <strong>Desde:</strong> {currentTrip.pickupAddress}</p>
          <p>🏁 <strong>Hacia:</strong> {currentTrip.dropoffAddress}</p>
          {currentTrip.driver ? (
            <div style={{ marginTop: '15px', background: '#f5f5f5', padding: '15px', borderRadius: '6px' }}>
              <h4>Tu Conductor:</h4>
              <p>🚗 <strong>{currentTrip.driver.firstName} {currentTrip.driver.lastName}</strong></p>
              <p>⭐ <strong>Calificación:</strong> {currentTrip.driver.rating || '5.0'} / 5</p>
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#777' }}>⏳ Buscando conductor...</p>
          )}
        </div>
      )}

      {/* COMPONENTE 3: HISTORIAL + BADGES DE ESTADO + FORMULARIO DE CALIFICACIÓN */}
      <h3>Historial de viajes</h3>
      {trips.length === 0 ? <p>No tienes viajes registrados.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {trips.map(t => (
            <div key={t.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <small style={{ color: '#999' }}>Viaje #{t.id}</small>
                  <div><strong>Destino:</strong> {t.dropoffAddress}</div>
                </div>
                {/* Badge exigido por el Punto 2 de la rúbrica */}
                <span style={{
                  padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                  background: t.status === 'COMPLETED' ? '#e0e0e0' : t.status === 'IN_PROGRESS' ? '#d4edda' : '#fff3cd',
                  color: t.status === 'COMPLETED' ? '#666' : t.status === 'IN_PROGRESS' ? '#155724' : '#856404'
                }}>
                  {t.status}
                </span>
              </div>

              {/*RÚBRICA PUNTO 4: Si está COMPLETED y no ha sido calificado, mostrar formulario */}
                {t.status === 'COMPLETED' && !(t as any).passengerRating && ratedTripId !== t.id && (                <div style={{ marginTop: '10px', padding: '10px', background: '#fff9e6', borderRadius: '6px', border: '1px solid #ffeeba' }}>
                  <strong style={{ fontSize: '13px', color: '#856404' }}>⭐ Califica este servicio:</strong>
                  <div style={{ display: 'flex', gap: '10px', margin: '5px 0' }}>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: '4px' }}>
                      <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                      <option value="4">⭐⭐⭐⭐ (4)</option>
                      <option value="3">⭐⭐⭐ (3)</option>
                      <option value="2">⭐⭐ (2)</option>
                      <option value="1">⭐ (1)</option>
                    </select>
                    <input type="text" placeholder="Comentario opcional..." value={comment} onChange={(e) => setComment(e.target.value)} style={{ flex: 1, padding: '4px' }} />
                    <button onClick={() => handleRateTrip(t.id)} style={{ background: '#ffc107', border: 'none', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};