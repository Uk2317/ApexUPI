import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthContainer, AuthCard, AuthLogo, FormField, Button, AuthLink, ErrorMsg } from '../components/SharedStyles';
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputWithIcon = (icon, rest) => (
    <div style={{ position: 'relative' }}>
      {icon}
      <input {...rest} style={{ ...rest.style, paddingLeft: 42 }} />
    </div>
  );

  const iconStyle = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthLogo>
          <div className="logo-icon">₹</div>
          <h1>Create Account</h1>
          <p>Start your digital wallet journey</p>
        </AuthLogo>

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField>
              <label>First Name</label>
              {inputWithIcon(<User size={18} style={iconStyle} />, {
                type: 'text', placeholder: 'First name', value: form.first_name,
                onChange: (e) => setForm({ ...form, first_name: e.target.value }), required: true
              })}
            </FormField>
            <FormField>
              <label>Last Name</label>
              <input
                type="text" placeholder="Last name" value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })} required
              />
            </FormField>
          </div>

          <FormField>
            <label>Email Address</label>
            {inputWithIcon(<Mail size={18} style={iconStyle} />, {
              type: 'email', placeholder: 'you@example.com', value: form.email,
              onChange: (e) => setForm({ ...form, email: e.target.value }), required: true
            })}
          </FormField>

          <FormField>
            <label>Phone Number (Optional)</label>
            {inputWithIcon(<Phone size={18} style={iconStyle} />, {
              type: 'tel', placeholder: '+91 98765 43210', value: form.phone,
              onChange: (e) => setForm({ ...form, phone: e.target.value })
            })}
          </FormField>

          <FormField>
            <label>Password</label>
            {inputWithIcon(<Lock size={18} style={iconStyle} />, {
              type: 'password', placeholder: 'Min 6 characters', value: form.password,
              onChange: (e) => setForm({ ...form, password: e.target.value }), required: true, minLength: 6
            })}
          </FormField>

          <FormField>
            <label>Confirm Password</label>
            {inputWithIcon(<Lock size={18} style={iconStyle} />, {
              type: 'password', placeholder: 'Re-enter password', value: form.confirmPassword,
              onChange: (e) => setForm({ ...form, confirmPassword: e.target.value }), required: true
            })}
          </FormField>

          <Button type="submit" $variant="primary" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <AuthLink>
          Already have an account? <Link to="/login">Sign In</Link>
        </AuthLink>
      </AuthCard>
    </AuthContainer>
  );
}
