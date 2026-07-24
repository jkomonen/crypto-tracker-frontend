import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://cryptocurrency-portfolio-tracker-api.onrender.com/cryptos/';

const AVATAR_PALETTE = [
  '#0071e3', '#ff9f0a', '#34c759', '#af52de',
  '#ff375f', '#5ac8fa', '#ffd60a', '#30d158',
];

function avatarColor(name) {
  const code = (name || '').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });

function SkeletonRows() {
  return (
    <div className="card">
      {[0, 1, 2].map(i => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '35%', height: 14, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '20%', height: 12 }} />
          </div>
          <div className="skeleton" style={{ width: 70, height: 14 }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="empty-state-title">No holdings yet</div>
        <p className="empty-state-text">Add your first cryptocurrency purchase to start tracking your portfolio.</p>
        <div style={{ marginTop: 20 }}>
          <Link to="/create" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '10px 22px' }}>
            Add To Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

function Holding({ crypto, onDelete }) {
  const amount = parseFloat(crypto.amount) || 0;
  const price = parseFloat(crypto.price) || 0;
  const value = amount * price;

  return (
    <div className="holding-row fade-in">
      <div className="holding-avatar" style={{ background: avatarColor(crypto.username) }}>
        {(crypto.username || '?').charAt(0)}
      </div>
      <div className="holding-main">
        <div className="holding-name">{crypto.username}</div>
        <div className="holding-meta">
          {number.format(amount)} · purchased {crypto.date.substring(0, 10)}
        </div>
      </div>
      <div className="holding-figures">
        <div className="holding-value">{currency.format(value)}</div>
        <div className="holding-price">{currency.format(price)} / unit</div>
      </div>
      <div className="holding-actions">
        <Link to={`/edit/${crypto._id}`} className="icon-btn" title="Edit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <button className="icon-btn danger" title="Delete" onClick={() => onDelete(crypto._id)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function CryptoList() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(response => {
        setCryptos(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const deleteCrypto = useCallback((id) => {
    if (!window.confirm('Remove this holding from your portfolio?')) return;

    axios.delete(API_URL + id)
      .then(response => console.log(response.data))
      .catch((error) => console.log(error));

    setCryptos(prev => prev.filter(el => el._id !== id));
  }, []);

  const totalValue = cryptos.reduce((sum, c) => sum + (parseFloat(c.amount) || 0) * (parseFloat(c.price) || 0), 0);
  const uniqueAssets = new Set(cryptos.map(c => c.username)).size;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">My Portfolio</h1>
            <p className="page-subtitle">A snapshot of everything you're holding.</p>
          </div>
          <Link to="/create" className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
            + Add Holding
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Value</div>
          <div className="stat-value">{currency.format(totalValue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Holdings</div>
          <div className="stat-value">{cryptos.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unique Assets</div>
          <div className="stat-value">{uniqueAssets}</div>
        </div>
      </div>

      {loading ? (
        <SkeletonRows />
      ) : cryptos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="card">
          {cryptos.map(crypto => (
            <Holding crypto={crypto} onDelete={deleteCrypto} key={crypto._id} />
          ))}
        </div>
      )}
    </div>
  );
}
