import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, SectionTitle, EmptyState } from '../components/SharedStyles';
import { ArrowUpRight, ArrowDownLeft, Plus, Search, Filter, ChevronDown } from 'lucide-react';
import styled from 'styled-components';

const FilterBtn = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.$active ? '#0070ba' : '#e1e4e8'};
  background: ${props => props.$active ? '#0070ba' : '#f5f7fa'};
  color: ${props => props.$active ? 'white' : '#1a1a2e'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;

const TxnItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child { border-bottom: none; }
  
  .icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .info {
    flex: 1;
    min-width: 0;
    
    p:first-child { font-size: 14px; font-weight: 600; color: #1a1a2e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    p:last-child { font-size: 12px; color: #9ca3af; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }
  
  .amount {
    text-align: right;
    flex-shrink: 0;
    
    p:first-child { font-size: 14px; font-weight: 700; }
    p:last-child { font-size: 11px; color: '#9ca3af'; }
  }
`;

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/wallet/transactions?limit=100').then(res => {
      setTransactions(res.data.transactions);
      setFiltered(res.data.transactions);
    });
  }, []);

  useEffect(() => {
    let result = transactions;
    if (filter !== 'all') result = result.filter(t => t.type === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.counterparty?.name?.toLowerCase().includes(q) ||
        t.note?.toLowerCase().includes(q) ||
        t.reference_id?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [filter, search, transactions]);

  const totalSent = transactions.filter(t => t.type === 'sent').reduce((s, t) => s + t.amount, 0);
  const totalReceived = transactions.filter(t => t.type === 'received').reduce((s, t) => s + t.amount, 0);
  const totalAdded = transactions.filter(t => t.type === 'added').reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>Transaction History</h1>
        <p style={{ color: '#6c757d', fontSize: 14, marginTop: 4 }}>All your payments at a glance</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        <Card style={{ textAlign: 'center', padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#de3535', textTransform: 'uppercase', marginBottom: 4 }}>Sent</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>₹{totalSent.toLocaleString('en-IN')}</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#00b900', textTransform: 'uppercase', marginBottom: 4 }}>Received</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>₹{totalReceived.toLocaleString('en-IN')}</p>
        </Card>
        <Card style={{ textAlign: 'center', padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#0070ba', textTransform: 'uppercase', marginBottom: 4 }}>Added</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>₹{totalAdded.toLocaleString('en-IN')}</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            style={{ width: '100%', padding: '12px 16px 12px 42px', border: '2px solid #e1e4e8', borderRadius: 12, fontSize: 14, color: '#1a1a2e', background: '#fff', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'sent', 'received', 'added'].map(f => (
            <FilterBtn key={f} $active={filter === f} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </FilterBtn>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <EmptyState>
          <h3>No transactions found</h3>
          <p>Try a different search or filter</p>
        </EmptyState>
      ) : (
        <Card>
          {filtered.map((txn) => (
            <TxnItem key={txn.id}>
              <div className="icon-wrap" style={{
                background: txn.type === 'sent' ? '#fff0f0' : txn.type === 'received' ? '#f0fff4' : '#e1f0ff'
              }}>
                {txn.type === 'sent' ? <ArrowUpRight size={18} style={{ color: '#de3535' }} /> :
                 txn.type === 'received' ? <ArrowDownLeft size={18} style={{ color: '#00b900' }} /> :
                 <Plus size={18} style={{ color: '#0070ba' }} />}
              </div>
              <div className="info">
                <p>{txn.type === 'sent' ? txn.counterparty?.name : txn.type === 'received' ? txn.counterparty?.name : 'Added Money'}</p>
                <p>{txn.note} · {txn.method?.toUpperCase()}</p>
              </div>
              <div className="amount">
                <p style={{ color: txn.type === 'sent' ? '#de3535' : txn.type === 'received' ? '#00b900' : '#0070ba' }}>
                  {txn.type === 'sent' ? '-' : '+'}₹{Number(txn.amount).toLocaleString('en-IN')}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>
                  {new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </TxnItem>
          ))}
        </Card>
      )}
    </div>
  );
}
