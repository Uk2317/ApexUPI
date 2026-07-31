import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, Button, FormField, ErrorMsg } from '../components/SharedStyles';
import styled from 'styled-components';
import { Plus, Building2, CreditCard, Banknote, CheckCircle, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

const MethodCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  border: 2px solid ${props => props.$selected ? '#0070ba' : '#e1e4e8'};
  background: ${props => props.$selected ? '#e1f0ff' : '#ffffff'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  position: relative;
  
  &:hover {
    border-color: #0070ba;
  }
  
  .method-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .method-info {
    flex: 1;
    
    p:first-child {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
    }
    
    p:last-child {
      font-size: 12px;
      color: #9ca3af;
    }
  }
  
  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .trash-btn {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: all 0.2s;
    
    &:hover {
      color: #de3535;
      background: #fff0f0;
    }
  }
  
  .check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid ${props => props.$selected ? '#0070ba' : '#e1e4e8'};
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$selected ? '#0070ba' : 'transparent'};
  }
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  
  button {
    padding: 8px 16px;
    border-radius: 20px;
    border: 2px solid ${props => props.$active ? '#0070ba' : '#e1e4e8'};
    background: ${props => props.$active ? '#0070ba' : '#f5f7fa'};
    color: ${props => props.$active ? 'white' : '#1a1a2e'};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
`;

const FormSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  color: #166534;
  font-size: 12px;
  font-weight: 500;
`;

export default function AddMoney() {
  const { user, refreshUser, showNotification } = useAuth();
  const [amount, setAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPMId, setSelectedPMId] = useState('');
  const [method, setMethod] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [newMethodType, setNewMethodType] = useState('');
  

  const [bankName, setBankName] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIFSC, setBankIFSC] = useState('');

  const [cardIssuer, setCardIssuer] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      setBankHolderName(fullName);
      setCardHolderName(fullName);
    }
  }, [user]);

  const fetchPaymentMethods = () => {
    api.get('/wallet/payment-methods').then(res => {
      const methods = res.data.payment_methods || [];
      setPaymentMethods(methods);
      if (methods.length > 0) {
        const defaultMethod = methods.find(m => m.is_default) || methods[0];
        setSelectedPMId(defaultMethod.id);
        setMethod(defaultMethod.type);
        setIsNew(false);
      } else {

        setIsNew(true);
        setNewMethodType('bank');
        setMethod('bank');
      }
    }).catch(err => {
      console.error('Error fetching payment methods', err);
    });
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleBankAccountNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 18) {
      setBankAccountNumber(value);
    }
  };

  const handleIFSCChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 11) {
      setBankIFSC(value);
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardCVV(value);
    }
  };

  const validateExpiry = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Expiry must be in MM/YY format.';
    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    if (month < 1 || month > 12) return 'Invalid month in expiry date.';
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Card has expired.';
    }
    return null;
  };

  const validateForm = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return 'Please enter a valid amount.';
    }
    if (numAmount > 100000) {
      return 'Maximum ₹1,00,000 per transaction.';
    }

    if (isNew) {
      if (newMethodType === 'bank') {
        if (!bankName.trim()) return 'Bank name is required.';
        if (!bankHolderName.trim()) return 'Account holder name is required.';
        if (!/^\d{9,18}$/.test(bankAccountNumber)) return 'Account number must be between 9 and 18 digits.';
        if (bankIFSC.length !== 11) return 'IFSC code must be exactly 11 characters.';
      } else {
        const cleanedCardNum = cardNumber.replace(/\s+/g, '');
        if (!cardIssuer.trim()) return 'Card issuer / bank name is required.';
        if (!cardHolderName.trim()) return 'Cardholder name is required.';
        if (!/^\d{15,16}$/.test(cleanedCardNum)) return 'Card number must be 15 or 16 digits.';
        const expiryError = validateExpiry(cardExpiry);
        if (expiryError) return expiryError;
        if (!/^\d{3}$/.test(cardCVV)) return 'CVV must be exactly 3 digits.';
      }
    } else {
      if (!selectedPMId) {
        return 'Please select an existing payment method or add a new one.';
      }
    }
    return null;
  };

  const handleSelectSavedMethod = (pm) => {
    setSelectedPMId(pm.id);
    setMethod(pm.type);
    setIsNew(false);
    setError('');
  };

  const handleSelectNewMethodType = (type) => {
    setIsNew(true);
    setNewMethodType(type);
    setMethod(type);
    setSelectedPMId('');
    setError('');
  };

  const handleDeletePM = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }
    try {
      await api.delete(`/wallet/payment-methods/${id}`);
      showNotification('Payment method removed successfully.');
      fetchPaymentMethods();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to remove payment method.', 'error');
    }
  };

  const handleAddMoney = async () => {
    const formError = validateForm();
    if (formError) {
      setError(formError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      let finalPMId = selectedPMId;
      let finalMethod = isNew ? newMethodType : method;
      let providerName = '';

      if (isNew) {

        const payload = {
          type: newMethodType,
          provider: newMethodType === 'bank' ? bankName : cardIssuer,
          account_holder: newMethodType === 'bank' ? bankHolderName : cardHolderName,
          last_four: (newMethodType === 'bank' ? bankAccountNumber : cardNumber.replace(/\s+/g, '')).slice(-4)
        };
        providerName = payload.provider;

        const pmRes = await api.post('/wallet/payment-methods', payload);
        finalPMId = pmRes.data.payment_method.id;
        finalMethod = pmRes.data.payment_method.type;
      } else {
        const pm = paymentMethods.find(m => m.id === selectedPMId);
        providerName = pm ? pm.provider : 'Payment Method';
      }

      const res = await api.post('/wallet/add-money', {
        amount: parseFloat(amount),
        method: finalMethod,
        payment_method_id: finalPMId,
        note: note || `Added via ${providerName}`,
      });

      await refreshUser();
      setSuccess(true);
      showNotification(res.data.message);
      

      if (isNew) {
        setBankName('');
        setBankAccountNumber('');
        setBankIFSC('');
        setCardIssuer('');
        setCardNumber('');
        setCardExpiry('');
        setCardCVV('');
      }
      

      fetchPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process transaction. Please try again.');
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
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Money Added!</h2>
        <p style={{ color: '#6c757d', marginBottom: 4 }}>₹{parseFloat(amount).toLocaleString('en-IN')} added to your wallet</p>
        <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 24 }}>New Balance: ₹{Number(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        <Button $variant="primary" onClick={() => { setSuccess(false); setAmount(''); setNote(''); }}>
          Add More Money
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>Add Money</h1>
        <p style={{ color: '#6c757d', fontSize: 14, marginTop: 4 }}>Add funds to your wallet using bank or card details</p>
      </div>

      {}
      <Card style={{ marginBottom: 16 }}>
        <FormField>
          <label style={{ fontSize: 14, fontWeight: 600 }}>Enter Amount</label>
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
        <QuickAmounts>
          {quickAmounts.map(amt => (
            <button key={amt} onClick={() => setAmount(String(amt))} style={{
              padding: '8px 16px', borderRadius: 20, border: `2px solid ${amount === String(amt) ? '#0070ba' : '#e1e4e8'}`,
              background: amount === String(amt) ? '#0070ba' : '#f5f7fa', color: amount === String(amt) ? 'white' : '#1a1a2e',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}>
              ₹{amt.toLocaleString('en-IN')}
            </button>
          ))}
        </QuickAmounts>
      </Card>

      {}
      <Card style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginBottom: 12 }}>
          Select Saved Payment Method
        </label>
        
        {paymentMethods.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16, fontStyle: 'italic' }}>
            No saved payment methods yet. Please add details below to add money.
          </p>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {paymentMethods.map((pm) => (
              <MethodCard 
                key={pm.id} 
                $selected={!isNew && selectedPMId === pm.id} 
                onClick={() => handleSelectSavedMethod(pm)}
              >
                <div className="method-icon" style={{
                  background: pm.type === 'bank' ? '#e1f0ff' : pm.type === 'credit_card' ? '#fff0f0' : '#f0fff4'
                }}>
                  {pm.type === 'bank' ? <Building2 size={20} style={{ color: '#0070ba' }} /> :
                   pm.type === 'credit_card' ? <CreditCard size={20} style={{ color: '#de3535' }} /> :
                   <Banknote size={20} style={{ color: '#00b900' }} />}
                </div>
                <div className="method-info">
                  <p>{pm.provider}</p>
                  <p>•••• {pm.last_four} · {pm.account_holder}</p>
                </div>
                <div className="actions">
                  <button className="trash-btn" onClick={(e) => handleDeletePM(e, pm.id)} title="Remove method">
                    <Trash2 size={16} />
                  </button>
                  <div className="check">
                    {!isNew && selectedPMId === pm.id && <CheckCircle size={14} style={{ color: 'white' }} />}
                  </div>
                </div>
              </MethodCard>
            ))}
          </div>
        )}

        {}
        <div style={{ padding: '12px 0 8px 0', borderTop: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 12 }}>Or add money via new details:</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { type: 'bank', label: 'Bank Account', icon: Building2, color: '#0070ba' },
              { type: 'credit_card', label: 'Credit Card', icon: CreditCard, color: '#de3535' },
              { type: 'debit_card', label: 'Debit Card', icon: Banknote, color: '#00b900' },
            ].map(item => (
              <button 
                key={item.type} 
                onClick={() => handleSelectNewMethodType(item.type)} 
                style={{
                  flex: 1, 
                  padding: '12px 8px', 
                  borderRadius: 10, 
                  border: `2px solid ${isNew && newMethodType === item.type ? item.color : '#e1e4e8'}`,
                  background: isNew && newMethodType === item.type ? `${item.color}10` : 'white', 
                  cursor: 'pointer', 
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isNew && newMethodType === item.type ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <item.icon size={18} style={{ color: item.color, marginBottom: 4 }} />
                <p style={{ fontSize: 11, fontWeight: 600, color: '#1a1a2e' }}>{item.label}</p>
              </button>
            ))}
          </div>
        </div>

        {}
        {isNew && (
          <FormSection>
            {newMethodType === 'bank' ? (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#003087', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={16} /> Enter Bank Account Details
                </h4>
                <FormField>
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                  />
                </FormField>
                <FormField>
                  <label>Account Holder Name</label>
                  <input
                    type="text"
                    value={bankHolderName}
                    onChange={(e) => setBankHolderName(e.target.value)}
                    placeholder="Account Holder's Name"
                  />
                </FormField>
                <FormField>
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={handleBankAccountNumberChange}
                    placeholder="Enter Account Number"
                  />
                </FormField>
                <FormField>
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={bankIFSC}
                    onChange={handleIFSCChange}
                    placeholder="e.g. HDFC0001234"
                  />
                </FormField>
              </div>
            ) : (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#003087', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={16} /> Enter {newMethodType === 'credit_card' ? 'Credit' : 'Debit'} Card Details
                </h4>
                <FormField>
                  <label>Card Issuer / Bank Name</label>
                  <input
                    type="text"
                    value={cardIssuer}
                    onChange={(e) => setCardIssuer(e.target.value)}
                    placeholder="e.g. HDFC Visa, ICICI MasterCard"
                  />
                </FormField>
                <FormField>
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolderName}
                    onChange={(e) => setCardHolderName(e.target.value)}
                    placeholder="Name on card"
                  />
                </FormField>
                <FormField>
                  <label>Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="xxxx xxxx xxxx xxxx"
                  />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField>
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                    />
                  </FormField>
                  <FormField>
                    <label>CVV</label>
                    <input
                      type="password"
                      value={cardCVV}
                      onChange={handleCVVChange}
                      placeholder="•••"
                    />
                  </FormField>
                </div>
              </div>
            )}
            
            <SecurityBadge>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>PCI-DSS Compliant:</strong> Your complete financial details are processed securely and never saved on our servers. Only the last 4 digits are saved for transaction records.
              </span>
            </SecurityBadge>
          </FormSection>
        )}
      </Card>

      {}
      <Card style={{ marginBottom: 16 }}>
        <FormField>
          <label style={{ fontSize: 14, fontWeight: 600 }}>Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Initial Deposit, Monthly Savings"
          />
        </FormField>
      </Card>

      {error && (
        <ErrorMsg style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </ErrorMsg>
      )}

      <Button $variant="primary" onClick={handleAddMoney} disabled={loading || !amount}>
        <Plus size={18} />
        {loading ? 'Processing...' : `Add ₹${amount ? parseFloat(amount).toLocaleString('en-IN') : '0'}`}
      </Button>
    </div>
  );
}
