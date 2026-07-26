import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import http from 'http';

// Must be a literal: jest hoists the mock above the imports, so it can't close
// over anything defined later in the file.
const PORT = 5811;
jest.mock('../api', () => 'http://localhost:5811');

// eslint-disable-next-line import/first
import BootGate from './boot-gate.component';

// These run against a real socket through jsdom's XHR, so they exercise the
// thing that actually broke in production: a response that takes longer to
// arrive than the gate was willing to wait.
jest.setTimeout(30000);

let server;
let respondAfterMs = 0;
let container;

function startServer() {
  return new Promise(resolve => {
    server = http.createServer((req, res) => {
      setTimeout(() => {
        // A cold Render container answers with the app's normal CORS headers
        // once it's up; without these the browser blocks the read and the gate
        // can't tell "awake" from "unreachable".
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end('[]');
      }, respondAfterMs);
    });
    server.listen(PORT, '127.0.0.1', resolve);
  });
}

// React 16.8 has no async act(), so waits happen outside act and the resulting
// state updates land synchronously on their own.
const wait = ms => new Promise(r => setTimeout(r, ms));
const flush = () => wait(150);

// The gate's state updates are driven by timers and sockets rather than by
// events we fire, and React 16.8 can't wrap those. The warning is expected.
const realError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) return;
    realError(...args);
  };
  return startServer();
});

afterAll(done => {
  console.error = realError;
  server.close(done);
});

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
});

const render = () =>
  act(() => {
    ReactDOM.render(<BootGate><div id="app">portfolio</div></BootGate>, container);
  });

test('a slow cold start keeps the gate up, then reveals the app', async () => {
  respondAfterMs = 3000;
  render();

  // Nothing at all for the first moments, so a warm server never flashes.
  expect(container.textContent).toBe('');

  await wait(1200);
  expect(container.querySelector('.boot-gate')).not.toBeNull();
  expect(container.querySelector('#app')).toBeNull();

  // Past the threshold the copy names the cold start rather than staying vague.
  await wait(3000);
  await flush();

  expect(container.querySelector('#app')).not.toBeNull();
  expect(container.querySelector('.boot-gate')).toBeNull();
  expect(container.textContent).toContain('portfolio');
});

test('a warm server reveals the app without ever painting the gate', async () => {
  respondAfterMs = 0;
  render();
  await flush();

  expect(container.querySelector('#app')).not.toBeNull();
  expect(container.querySelector('.boot-gate')).toBeNull();
});

// The real cold start: for the first stretch the container isn't accepting
// connections at all, so the request fails outright rather than hanging. The
// gate has to keep waiting through that instead of calling it unreachable.
test('a container that is not listening yet is waited out, not failed', async () => {
  await new Promise(r => server.close(r));
  respondAfterMs = 0;
  render();

  await wait(1200);
  expect(container.querySelector('.boot-gate')).not.toBeNull();
  expect(container.textContent).not.toContain("Couldn't reach the server");

  await startServer();
  await wait(4000);
  await flush();

  expect(container.querySelector('#app')).not.toBeNull();
  expect(container.querySelector('.boot-gate')).toBeNull();
});

test('the gate explains the cold start once the wait gets long', async () => {
  respondAfterMs = 6000;
  render();

  await wait(1000);
  expect(container.textContent).toContain('Loading your portfolio');

  await wait(3500);
  expect(container.textContent).toContain('Waking the server');

  await wait(2500);
  await flush();
  expect(container.querySelector('#app')).not.toBeNull();
});
