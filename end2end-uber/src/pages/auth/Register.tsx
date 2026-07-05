import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

export const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'PASSENGER' | 'DRIVER'>('PASSENGER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { email, password, firstName, lastName, role });
      const { token, user } = response.data;
      
      login(token, user);
      
      if (user.role === 'PASSENGER') {
        navigate('/passenger');
      } else {
        navigate('/driver');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Crear Cuenta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong>Nombre:</strong>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ padding: '8px' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong>Apellido:</strong>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ padding: '8px' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong>Correo Electrónico:</strong>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '8px' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong>Contraseña:</strong>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '8px' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong>Quiero registrarme como:</strong>
          <select value={role} onChange={(e) => setRole(e.target.value as 'PASSENGER' | 'DRIVER')} style={{ padding: '8px' }}>
            <option value="PASSENGER">Pasajero</option>
            <option value="DRIVER">Conductor / Chofer</option>
          </select>
        </label>
        <button type="submit" disabled={loading} style={{ padding: '10px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        ¿Ya tienes cuenta? <Link to="/" style={{ color: 'blue' }}>Inicia sesión</Link>
      </p>
    </div>
  );
};