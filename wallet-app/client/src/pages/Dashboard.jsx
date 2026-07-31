import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { BalanceCard, Card, SectionTitle, EmptyState } from '../components/SharedStyles';
import { ArrowUpRight, ArrowDownLeft, Plus, QrCode, CreditCard, Wallet, ChevronRight, Zap, Smartphone, ShoppingBag } from 'lucide-react';
import styled from 'styled-components';

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const ActionBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover { transform: scale(1.05); }
  
  .icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
  }
  
  span {
    font-size: 11px;
    font-weight: 600;
    color: #6c757d;
  }
`;

const TxnItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  transition: background 0.2s;
  
  &:hover { background: #f5f7fa; }
  
  .icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .info {
    flex: 1;
    min-width: 0;
    
    p:first-child {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    p:last-child {
      font-size: 12px;
      color: #9ca3af;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .amount {
    text-align: right;
    flex-shrink: 0;
    
    p:first-child {
      font-size: 14px;
      font-weight: 700;
    }
    
    p:last-child {
      font-size: 11px;
      color: #9ca3af;
    }
  }
`;

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    refreshUser();
    api.get('/wallet/transactions?limit=5').then(res => setTransactions(res.data.transactions));
    api.get('/wallet/payment-methods').then(res => setPaymentMethods(res.data.payment_methods));
  }, []);

  const quickActions = [
    { icon: ArrowUpRight, label: 'Send', color: 'linear-gradient(135deg, #0070ba, #003087)', path: '/send' },
    { icon: ArrowDownLeft, label: 'Request', color: 'linear-gradient(135deg, #00b900, #008800)', path: '/receive' },
    { icon: Plus, label: 'Add Money', color: 'linear-gradient(135deg, #f5a623, #e8950a)', path: '/add-money' },
    { icon: QrCode, label: 'Scan QR', color: 'linear-gradient(135deg, #6c5ce7, #5a4bd1)', path: '/receive' },
  ];

  return (
    <div>
      {/* Balance Card */}
      <BalanceCard>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Wallet size={20} style={{ opacity: 0.8 }} />
            <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.8 }}>Available Balance</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
            ₹{Number(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h1>
          <p style={{ fontSize: 13, opacity: 0.6 }}>{user?.upi_id}</p>
        </div>
      </BalanceCard>

      {/* Quick Actions */}
      <QuickActions>
        {quickActions.map((action) => (
          <ActionBtn key={action.label} onClick={() => navigate(action.path)}>
            <div className="icon-wrap" style={{ background: action.color }}>
              <action.icon size={22} />
            </div>
            <span>{action.label}</span>
          </ActionBtn>
        ))}
      </QuickActions>

      {/* Payment Methods */}
      {paymentMethods.length > 0 && (
        <>
          <SectionTitle>
            <h2>Payment Methods</h2>
            <button onClick={() => navigate('/add-money')}>Manage</button>
          </SectionTitle>
          <Card style={{ marginBottom: 24 }}>
            {paymentMethods.map((pm) => (
              <div key={pm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: pm.type === 'bank' ? '#e1f0ff' : pm.type === 'credit_card' ? '#fff0f0' : '#f0fff4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CreditCard size={18} style={{ color: pm.type === 'bank' ? '#0070ba' : pm.type === 'credit_card' ? '#de3535' : '#00b900' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{pm.provider}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>•••• {pm.last_four}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>
                  {pm.type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* Recent Transactions */}
      <SectionTitle>
        <h2>Recent Activity</h2>
        <button onClick={() => navigate('/transactions')}>View All <ChevronRight size={14} /></button>
      </SectionTitle>

      {transactions.length === 0 ? (
        <EmptyState>
          <h3>No transactions yet</h3>
          <p>Add money or send your first payment!</p>
        </EmptyState>
      ) : (
        <Card>
          {transactions.map((txn) => (
            <TxnItem key={txn.id}>
              <div className="icon-wrap" style={{
                background: txn.type === 'sent' ? '#fff0f0' : txn.type === 'received' ? '#f0fff4' : '#e1f0ff'
              }}>
                {txn.type === 'sent' ? (
                  <ArrowUpRight size={18} style={{ color: '#de3535' }} />
                ) : txn.type === 'received' ? (
                  <ArrowDownLeft size={18} style={{ color: '#00b900' }} />
                ) : (
                  <Plus size={18} style={{ color: '#0070ba' }} />
                )}
              </div>
              <div className="info">
                <p>{txn.type === 'sent' ? txn.counterparty?.name : txn.type === 'received' ? txn.counterparty?.name : 'Added Money'}</p>
                <p>{txn.note}</p>
              </div>
              <div className="amount">
                <p style={{ color: txn.type === 'sent' ? '#de3535' : txn.type === 'received' ? '#00b900' : '#0070ba' }}>
                  {txn.type === 'sent' ? '-' : '+'}₹{Number(txn.amount).toLocaleString('en-IN')}
                </p>
                <p>{new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
            </TxnItem>
          ))}
        </Card>
      )}
    </div>
  );
}
