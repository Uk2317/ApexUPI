import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, Button, FormField, ErrorMsg } from '../components/SharedStyles';
import styled from 'styled-components';
import { ArrowUpRight, Search, X, CheckCircle, Send } from 'lucide-react';

const UserResult = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${props => props.$selected ? '#0070ba' : 'transparent'};
  background: ${props => props.$selected ? '#e1f0ff' : '#f5f7fa'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover { background: ${props => props.$selected ? '#e1f0ff' : '#ebebeb'}; }
  
  .avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0070ba, #009cde);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 14px;
  }
  
  .info {
    flex: 1;
    text-align: left;
    
    p:first-child { font-size: 14px; font-weight: 600; color: #1a1a2e; }
    p:last-child { font-size: 12px; color: #9ca3af; }
  }
`;

export default function SendMoney() {
  const { user, refreshUser, showNotification } = useAuth();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [upiInput, setUpiInput] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const res = await api.get(`/wallet/search-users?q=${query}`);
        setSearchResults(res.data.users);
      } catch {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSend = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (numAmount > (user?.balance || 0)) {
      setError('Insufficient balance. Please add money first.');
      return;
    }

    const recipientUpi = selectedRecipient?.upi_id || upiInput;
    if (!recipientUpi) {
      setError('Please select a recipient.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/wallet/send', {
        recipient_upi_id: recipientUpi,
        amount: numAmount,
        note,
      });
      await refreshUser();
      setSuccess(true);
      showNotification(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fff4', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <CheckCircle size={40} style={{ color: '#00b900' }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Payment Sent!</h2>
        <p style={{ color: '#6c757d', marginBottom: 4 }}>₹{parseFloat(amount).toLocaleString('en-IN')} sent to</p>
        <p style={{ color: '#0070ba', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{selectedRecipient ? `${selectedRecipient.first_name} ${selectedRecipient.last_name}` : upiInput}</p>
        <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 24 }}>New Balance: ₹{Number(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        <Button $variant="primary" onClick={() => { setSuccess(false); setStep(1); setAmount(''); setNote(''); setSelectedRecipient(null); setUpiInput(''); setSearchQuery(''); }}>
          <Send size={18} /> Send Another Payment
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>Send Money</h1>
        <p style={{ color: '#6c757d', fontSize: 14, marginTop: 4 }}>Transfer to anyone using their UPI ID</p>
      </div>

      {/* Step 1: Select Recipient */}
      {step === 1 && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <FormField>
              <label>Search by name or UPI ID</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Type a name or UPI ID..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </FormField>

            {searchResults.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase' }}>Search Results</p>
                {searchResults.map((u) => (
                  <UserResult
                    key={u.id}
                    $selected={selectedRecipient?.id === u.id}
                    onClick={() => { setSelectedRecipient(u); setUpiInput(''); setStep(2); }}
                  >
                    <div className="avatar">{u.first_name[0]}{u.last_name[0]}</div>
                    <div className="info">
                      <p>{u.first_name} {u.last_name}</p>
                      <p>{u.upi_id}</p>
                    </div>
                    <ArrowUpRight size={16} style={{ color: '#9ca3af' }} />
                  </UserResult>
                ))}
              </div>
            )}
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <FormField>
              <label>Or enter UPI ID directly</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="username@upi"
                  value={upiInput}
                  onChange={(e) => { setUpiInput(e.target.value); setSelectedRecipient(null); }}
                />
                <Button $variant="primary" style={{ width: 'auto', padding: '12px 20px' }} disabled={!upiInput} onClick={() => { if (upiInput) setStep(2); }}>
                  Pay
                </Button>
              </div>
            </FormField>
          </Card>
        </>
      )}

      {/* Step 2: Enter Amount */}
      {step === 2 && (
        <>
          {/* Recipient Summary */}
          <Card style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            {selectedRecipient ? (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #0070ba, #009cde)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                  {selectedRecipient.first_name[0]}{selectedRecipient.last_name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: '#1a1a2e' }}>{selectedRecipient.first_name} {selectedRecipient.last_name}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>{selectedRecipient.upi_id}</p>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  <ArrowUpRight size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: '#1a1a2e' }}>{upiInput}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>UPI ID</p>
                </div>
              </>
            )}
            <button onClick={() => { setStep(1); setSelectedRecipient(null); setUpiInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={20} />
            </button>
          </Card>

          {/* Amount */}
          <Card style={{ marginBottom: 16 }}>
            <FormField>
              <label>Enter Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 22, fontWeight: 700, color: '#9ca3af' }}>₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  style={{ paddingLeft: 40, fontSize: 24, fontWeight: 700 }}
                />
              </div>
            </FormField>
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

          {/* Note */}
          <Card style={{ marginBottom: 16 }}>
            <FormField>
              <label>Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's this for?"
              />
            </FormField>
          </Card>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <Button $variant="primary" onClick={handleSend} disabled={loading || !amount}>
            <Send size={18} />
            {loading ? 'Processing...' : `Pay ₹${amount ? parseFloat(amount).toLocaleString('en-IN') : '0'}`}
          </Button>
        </>
      )}
    </div>
  );
}
