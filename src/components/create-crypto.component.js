import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import API_URL from '../api';

export default function CreateCrypto() {
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/users/`)
      .then(response => {
        if (response.data.length > 0) {
          setUsers(response.data.map(user => user.username));
          setUsername(response.data[0].username);
        }
      })
      .catch((error) => console.log(error));
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const crypto = { username, amount, price, date };
    console.log(crypto);

    axios.post(`${API_URL}/cryptos/add`, crypto)
      .then(res => {
        console.log(res.data);
        history.push('/');
      })
      .catch((error) => {
        console.log(error);
        setSubmitting(false);
      });
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add To Portfolio</h1>
        <p className="page-subtitle">Log a new cryptocurrency purchase.</p>
      </div>

      <div className="form-card">
        <form onSubmit={onSubmit}>
          <div className="form-field">
            <label>Cryptocurrency</label>
            <select
              required
              className="form-select"
              value={username}
              onChange={e => setUsername(e.target.value)}
            >
              {users.length === 0 && <option value="">No cryptocurrencies yet</option>}
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Amount Purchased</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Price</label>
            <input
              type="text"
              className="form-input"
              placeholder="$0.00"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Purchase Date</label>
            <DatePicker selected={date} onChange={setDate} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: 6 }}>
            {submitting ? 'Adding…' : 'Add To Portfolio'}
          </button>
        </form>
      </div>
    </div>
  );
}
