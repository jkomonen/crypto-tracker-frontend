import React, { useState } from 'react';
import axios from 'axios';

import API_BASE from '../api';

const API_URL = `${API_BASE}/users/add`;

export default function CreateUser() {
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const user = { username };
    console.log(user);

    axios.post(API_URL, user)
      .then(res => {
        console.log(res.data);
        setJustAdded(username);
        setUsername('');
        setSubmitting(false);
      })
      .catch((error) => {
        console.log(error);
        setSubmitting(false);
      });
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Cryptocurrency</h1>
        <p className="page-subtitle">Register a new asset so it can be added to a portfolio.</p>
      </div>

      <div className="form-card">
        <form onSubmit={onSubmit}>
          <div className="form-field">
            <label>Cryptocurrency Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Bitcoin"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add New Cryptocurrency'}
          </button>

          {justAdded && (
            <p style={{ marginTop: 14, fontSize: 13, color: 'var(--color-success)', textAlign: 'center' }}>
              “{justAdded}” was added.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
