import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/SharedStyles';
import { CreditCard, Shield, Bell, HelpCircle, LogOut, ChevronRight, User, Wallet } from 'lucide-react';
import styled from 'styled-components';

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.2s;
  
  &:hover { background: #f5f7fa; }
  
  .icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .info {
    flex: 1;
    text-align: left;
    
    p:first-child { font-size: 14px; font-weight: 600; color: #1a1a2e; }
    p:last-child { font-size: 12px; color: #9ca3af; }
  }
`;

export default function Profile() {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: CreditCard, label: 'Payment Methods', subtitle: 'Manage your cards & bank accounts', color: '#0070ba' },
    { icon: Shield, label: 'Security', subtitle: 'Password & privacy settings', color: '#00b900' },
    { icon: Bell, label: 'Notifications', subtitle: 'Alerts & transaction updates', color: '#f5a623' },
    { icon: HelpCircle, label: 'Help & Support', subtitle: 'FAQs & customer care', color: '#6c5ce7' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>Profile</h1>
        <p style={{ color: '#6c757d', fontSize: 14, marginTop: 4 }}>Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #003087 0%, #0070ba 60%, #009cde 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user?.first_name} {user?.last_name}</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>{user?.upi_id}</p>
            <p style={{ fontSize: 12, opacity: 0.6 }}>{user?.email}</p>
          </div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8 }}>
            <Wallet size={16} />
            <span style={{ fontSize: 13 }}>Available Balance</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>₹{Number(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </Card>

      {/* Menu Items */}
      <Card style={{ marginBottom: 16, padding: 8 }}>
        {menuItems.map((item) => (
          <MenuItem key={item.label}>
            <div className="icon-wrap">
              <item.icon size={20} style={{ color: item.color }} />
            </div>
            <div className="info">
              <p>{item.label}</p>
              <p>{item.subtitle}</p>
            </div>
            <ChevronRight size={16} style={{ color: '#9ca3af' }} />
          </MenuItem>
        ))}
      </Card>

      {/* Logout */}
      <Button $variant="danger" onClick={logout}>
        <LogOut size={18} />
        Log Out
      </Button>

      <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 24 }}>ApexUPI v1.0.0</p>
    </div>
  );
}
