import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthContainer, AuthCard, AuthLogo, FormField, Button, AuthLink, ErrorMsg } from '../components/SharedStyles';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthLogo>
          <div className="logo-icon">₹</div>
          <h1>ApexUPI</h1>
          <p>Sign in to your account</p>
        </AuthLogo>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <form onSubmit={handleSubmit}>
          <FormField>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                style={{ paddingLeft: 42 }}
              />
            </div>
          </FormField>

          <FormField>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingLeft: 42 }}
              />
            </div>
          </FormField>

          <Button type="submit" $variant="primary" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <AuthLink>
          Don't have an account? <Link to="/register">Create Account</Link>
        </AuthLink>

        <div style={{ marginTop: 16, padding: 12, background: '#f0f7ff', borderRadius: 10, fontSize: 12, color: '#6c757d' }}>
          <strong style={{ color: '#0070ba' }}>Demo:</strong> arjun@example.com / pass123
        </div>
      </AuthCard>
    </AuthContainer>
  );
}
