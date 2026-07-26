import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";

import BootGate from "./components/boot-gate.component";
import Navbar from "./components/navbar.component";
import CryptoList from "./components/crypto-list.component";
import EditCrypto from "./components/edit-crypto.component";
import CreateCrypto from "./components/create-crypto.component";
import CreateUser from "./components/create-user.component";

function App() {
  return (
    // The API is a free Render service that sleeps, so nothing is rendered
    // until it answers — otherwise the app appears fully loaded but inert for
    // the ~30s the cold start takes.
    <BootGate>
      <Router>
        <div className="app-shell">
          <Navbar />
          <main className="app-main">
            <Switch>
              <Route path="/" exact component={CryptoList} />
              <Route path="/edit/:id" component={EditCrypto} />
              <Route path="/create" component={CreateCrypto} />
              <Route path="/user" component={CreateUser} />
            </Switch>
          </main>
        </div>
      </Router>
    </BootGate>
  );
}

export default App;
