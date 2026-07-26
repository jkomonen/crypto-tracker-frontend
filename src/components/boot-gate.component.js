import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import API_BASE from '../api';

// How long a single health request is given before we assume it was swallowed
// by the cold start and try again.
const ATTEMPT_TIMEOUT_MS = 6000;
const RETRY_DELAY_MS = 1500;
// Render's free tier usually needs 20-50s from cold. Past this we stop waiting
// and let the user decide.
const GIVE_UP_MS = 120000;
// Don't flash the screen at people whose backend is already awake.
const SHOW_AFTER_MS = 450;
// After this long it's clearly a cold start, so explain what's happening.
const EXPLAIN_AFTER_MS = 3500;

// Eases toward — but never reaches — 96%, so the bar always looks like it's
// making progress without promising a finish time we can't predict.
function progressFor(elapsedMs) {
  return 96 * (1 - Math.exp(-elapsedMs / 22000));
}

export default function BootGate({ children }) {
  const [status, setStatus] = useState('waking'); // waking | ready | failed
  const [elapsed, setElapsed] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const startedAt = useRef(Date.now());

  // Poll the health endpoint until the server answers.
  useEffect(() => {
    if (status !== 'waking') return undefined;

    let cancelled = false;
    let retryTimer = null;

    const ping = () => {
      axios
        .get(`${API_BASE}/health`, { timeout: ATTEMPT_TIMEOUT_MS })
        .then(() => {
          if (!cancelled) setStatus('ready');
        })
        .catch(error => {
          if (cancelled) return;
          // Any HTTP status at all means the container is up and serving — a
          // 404 just means this build is talking to a backend that predates
          // /health. Only a timeout or a network error means it's still cold.
          if (error.response) {
            setStatus('ready');
            return;
          }
          if (Date.now() - startedAt.current > GIVE_UP_MS) {
            setStatus('failed');
            return;
          }
          setAttempt(n => n + 1);
          retryTimer = setTimeout(ping, RETRY_DELAY_MS);
        });
    };

    ping();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
    // `attempt` is intentionally excluded: the retry chain lives inside `ping`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Drive the timer that the copy and the progress bar read from.
  useEffect(() => {
    if (status !== 'waking') return undefined;
    const tick = setInterval(() => setElapsed(Date.now() - startedAt.current), 200);
    return () => clearInterval(tick);
  }, [status]);

  const retry = () => {
    startedAt.current = Date.now();
    setElapsed(0);
    setAttempt(1);
    setStatus('waking');
  };

  if (status === 'ready') return <>{children}</>;

  // Server responded fast enough that a loading screen would just be a flicker.
  if (status === 'waking' && elapsed < SHOW_AFTER_MS) return null;

  const coldStart = elapsed >= EXPLAIN_AFTER_MS;
  const seconds = Math.floor(elapsed / 1000);

  return (
    <div className="boot-gate">
      <div className="boot-card fade-in">
        <div className="boot-mark">₿</div>

        {status === 'failed' ? (
          <>
            <h1 className="boot-title">Couldn't reach the server</h1>
            <p className="boot-text">
              The API didn't respond after {Math.floor(GIVE_UP_MS / 1000)} seconds. It may still be
              starting up, or it may be down.
            </p>
            <div className="boot-actions">
              <button className="btn btn-primary" onClick={retry} style={{ width: 'auto', padding: '10px 22px' }}>
                Try again
              </button>
              <button className="boot-link" onClick={() => setStatus('ready')}>
                Continue anyway
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="boot-spinner" aria-hidden="true" />
            <h1 className="boot-title">
              {coldStart ? 'Waking the server' : 'Loading your portfolio'}
            </h1>
            <p className="boot-text">
              {coldStart
                ? 'This project runs on free hosting, which puts the server to sleep after a while. The first visit takes about 30 seconds to start it back up — after that it’s instant.'
                : 'Connecting to your portfolio data.'}
            </p>

            <div className="boot-progress" role="progressbar" aria-label="Server startup">
              <div className="boot-progress-fill" style={{ width: `${progressFor(elapsed)}%` }} />
            </div>

            <div className="boot-status">
              {seconds}s elapsed{attempt > 1 ? ` · attempt ${attempt}` : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
