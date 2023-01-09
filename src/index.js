//reads code from App.js and runs it under 'root' by putting it in the index.html file under 'root'

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));