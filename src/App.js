//any changes we make here will be shown on the screen
//this whole thing gets sent to index.js and gets ran as 'root' then ran in index.html as 'root'

import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css"; //import bootstrap for easier styling
import { BrowserRouter as Router, Route} from "react-router-dom";

import Navbar from "./components/navbar.component"
import CryptoList from "./components/crypto-list.component";
import EditCrypto from "./components/edit-crypto.component";
import CreateCrypto from "./components/create-crypto.component";
import CreateUser from "./components/create-user.component";

//have to wrap everything in <Router> cuz im importing from react-router-dom
//components: navbar, cryptolist, editcrypto, createcrypto, createcrypto
//if u go to root/ url, you'll go to cryptolist component, etc
function App() {
  return (
    <Router>
      <div className="container">
      <Navbar />
      <br/>
      <Route path="/" exact component={CryptoList} />
      <Route path="/edit/:id" component={EditCrypto} />
      <Route path="/create" component={CreateCrypto} />
      <Route path="/user" component={CreateUser} />
      </div>
    </Router>
  );
}

export default App;
