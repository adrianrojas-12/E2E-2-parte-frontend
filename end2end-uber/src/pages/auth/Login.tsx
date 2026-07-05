import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

export const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Enviamos las credenciales para obtener ÚNICAMENTE el token
      const response = await api.post('/auth/login', { 
        email: email.trim(), 
        password 
      });
      
      const { token } = response.data;
      
      // Guardamos el token temporalmente en el localStorage para que la siguiente petición vaya autenticada
      localStorage.setItem('token', token);

      // 2. Hacemos la petición obligatoria al backend para saber QUIÉN es el usuario logueado
      const userResponse = await api.get('/users/me');
      const user = userResponse.data;
      
      // 3. Enviamos el token y el usuario real al Contexto Global
      login(token, user);
      
      // Redirección según el rol asignado por el backend
      if (user.role === 'PASSENGER') {
        navigate('/passenger');
      } else {
        navigate('/driver');
      }
    } catch (err: any) {
      // Leemos el error exacto que devuelva el backend en la propiedad "error" o "message"
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red', background: '#fff0f0', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <strong>Correo Electrónico:</strong>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '8px' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <strong>Contraseña:</strong>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '8px' }} />
        </label>
        <button type="submit" disabled={loading} style={{ padding: '10px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        ¿No tienes cuenta? <Link to="/register" style={{ color: 'blue' }}>Regístrate aquí</Link>
      </p>
    </div>
  );
};