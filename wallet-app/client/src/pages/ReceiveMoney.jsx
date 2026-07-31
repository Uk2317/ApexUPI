import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/SharedStyles';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Share2 } from 'lucide-react';

export default function ReceiveMoney() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const qrValue = amount
    ? `upi://pay?pa=${user?.upi_id}&pn=${encodeURIComponent(`${user?.first_name} ${user?.last_name}`)}&am=${amount}&cu=INR`
    : `upi://pay?pa=${user?.upi_id}&pn=${encodeURIComponent(`${user?.first_name} ${user?.last_name}`)}&cu=INR`;

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.upi_id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>Receive Money</h1>
        <p style={{ color: '#6c757d', fontSize: 14, marginTop: 4 }}>Share your QR code or UPI ID to receive payments</p>
      </div>

      {/* QR Code Card */}
      <Card style={{ textAlign: 'center', padding: 32, marginBottom: 16 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 20, display: 'inline-block', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <QRCodeSVG
            value={qrValue}
            size={180}
            level="H"
            bgColor="#ffffff"
            fgColor="#003087"
          />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
          {user?.first_name} {user?.last_name}
        </h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#e1f0ff', borderRadius: 20, padding: '8px 16px' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0070ba' }}>{user?.upi_id}</span>
          <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#00b900' : '#9ca3af' }}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </Card>

      {/* Request Amount */}
      <Card style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>Request Amount (Optional)</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 22, fontWeight: 700, color: '#9ca3af' }}>₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            style={{ width: '100%', padding: '12px 16px 12px 40px', border: '2px solid #e1e4e8', borderRadius: 12, fontSize: 24, fontWeight: 700, color: '#1a1a2e', background: '#f5f7fa', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {[100, 500, 1000, 2000, 5000].map(amt => (
            <button key={amt} onClick={() => setAmount(String(amt))} style={{
              padding: '8px 16px', borderRadius: 20, border: `2px solid ${amount === String(amt) ? '#0070ba' : '#e1e4e8'}`,
              background: amount === String(amt) ? '#0070ba' : '#f5f7fa', color: amount === String(amt) ? 'white' : '#1a1a2e',
              fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>
              ₹{amt.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Button $variant="secondary" onClick={handleCopy}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copied!' : 'Copy UPI ID'}
        </Button>
        <Button $variant="primary">
          <Share2 size={18} />
          Share QR Code
        </Button>
      </div>
    </div>
  );
}
