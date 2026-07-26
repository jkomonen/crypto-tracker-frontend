import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import API_BASE from '../api';

// The probe deliberately hits a route the app itself uses rather than /health.
// /health only exists on a backend built after it was added, and more
// importantly a real app route is guaranteed to carry the CORS headers the
// browser needs before it will let us read the response at all.
const PROBE_URL = `${API_BASE}/cryptos/`;

// Render queues a request aimed at a spun-down service and answers it from the
// container once it finishes booting, so the single most reliable way to wait
// out a cold start is to let one request ride the whole way.
//
// An earlier version aborted each attempt after 6s and retried. That could
// never succeed: a boot takes ~30s, so every attempt timed out, and each retry
// went back to the end of the queue. Worse, a retry that arrives mid-boot can
// be answered by Render's own error page, which carries no CORS headers — the
// browser blocks it, so it reaches us as an indistinguishable network error
// rather than a readable status. Hence one long attempt, not many short ones.
const ATTEMPT_TIMEOUT_MS = 120000;
const RETRY_DELAY_MS = 3000;
const GIVE_UP_MS = 180000;
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

  // Wait for the server to answer.
  useEffect(() => {
    if (status !== 'waking') return undefined;

    let cancelled = false;
    let retryTimer = null;

    const ping = () => {
      axios
        .get(PROBE_URL, { timeout: ATTEMPT_TIMEOUT_MS })
        .then(() => {
          if (!cancelled) setStatus('ready');
        })
        .catch(error => {
          if (cancelled) return;
          // Any readable HTTP status means the container is up and serving,
          // even a 4xx or 5xx — the app's own error handling can take it from
          // here. Only a timeout or a blocked/failed request means it's cold.
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
