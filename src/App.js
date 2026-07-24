import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/navbar.component";
import CryptoList from "./components/crypto-list.component";
import EditCrypto from "./components/edit-crypto.component";
import CreateCrypto from "./components/create-crypto.component";
import CreateUser from "./components/create-user.component";

function App() {
  return (
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
  );
}

export default App;
