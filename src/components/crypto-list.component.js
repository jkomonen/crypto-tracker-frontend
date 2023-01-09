//gonna be the homepage
//gonna show every excercise in the database

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; //sends hhtp requests from the frontend to backend (server)

//difference between functional and class react component is lack of state and lifecycle (componentDidMount()) methods
//if all u need to do it accept props and return JSX, use a function component instead of class

//component #1
//implemented as a functional react component
//we usually put all components in their own files but this is so small we just put it here
//this component is accepting props passed to it (return <crypto crypto={currentcrypto} deletecrypto={this.deletecrypto} key={currentcrypto._id}/>;)
//then its going to return a row of the table
//substring cuz date has date, time, and timezone and we just was the first part (date part)
//now were using <Link> from react-router-dom to link to a certain url which will load another component on the page
//edit button that goes to edit crypto component
//delete button so onclick it called props.deletecrypto
//squigglies cuz it wants it wants the a href to be a  instead of a link
const Crypto = props => (
  <tr>
    <td>{props.crypto.username}</td>
    <td>{props.crypto.amount}</td>
    <td>{props.crypto.price}</td>
    <td>{props.crypto.date.substring(0,10)}</td> 
    <td>
      <Link to={"/edit/"+props.crypto._id}>edit</Link> | <a href="#" onClick={() => { props.deleteCrypto(props.crypto._id) }}>delete</a>
    </td>
  </tr>
)

//component #2
//implemented as a class component
export default class CryptoList extends Component {
  constructor(props) {
    super(props); //need to call super when defining the constructor of a subclass. all react component classes that have a constructor start with a super props call

    this.deleteCrypto = this.deleteCrypto.bind(this) //method called deletecrypto cuz in the list of cryptos, you're gonna be able to click a button and delete the crypto

    this.state = {cryptos: []}; //set state to empty array of cryptos
  }

  //now we get the list of cryptos from the database
  //calls this before the page loads and add the list of cryptos to the state. 
  //cryptos.js gets all cryptos from the db and return it here as json
  componentDidMount() {
    axios.get('http://localhost:5000/cryptos/') //sends an http post request to the backend endpoint at that url. users.js is a backend file and received the username and saves it in the database
      .then(response => {
        this.setState({ cryptos: response.data }) //when we were getting usernames, we just got the username field cuz we didnt want the rest of the data. in this case, we want all the fields and we're going to put it in the 'cryptos' array on this line
      })
      .catch((error) => {
        console.log(error);
      })
  }

  deleteCrypto(id) { //the object id that mongodb auto assign that we're going to be deleting
    axios.delete('http://localhost:5000/cryptos/'+id) //sends a delete request to this url which is an exact route that is created in the backend
      .then(response => { console.log(response.data)}); //log its been deleted if successful

    //after deleting from the db, gotta delete whats being displayed to the user
    this.setState({ //set the state of 'cryptos' and react will auto update the page with the new state
      cryptos: this.state.cryptos.filter(el => el._id !== id) //this.state.cryptos (the array of cryptos), filter means its going to return certain elements back to 'cryptos'
    }) //continuation. for every element in cryptos array, return it if id != id. So, the one we want to delete doesn't get passed back
  } //_id is underscore because mongodb is _id

  cryptoList() {
    return this.state.cryptos.map(currentcrypto => { //.map will return something for every element in the array. so, for every element called 'currentcrypto', return a component which is basicall a row of the table
      return <Crypto crypto={currentcrypto} deleteCrypto={this.deleteCrypto} key={currentcrypto._id}/>;
    }) //continuation. were going to pass in 3 props. essentially variable name (crypto) = value: (currentcrypto)
  }

  //html like
  //whats going to display on the page
  //body is going to the call the cryptoList method which will return the rows of the table
  render() {
    return (
      <div>
        <h3>My Portfolio</h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Cryptocurrency</th>
              <th>Amount Purchased</th>
              <th>Price</th>
              <th>Purchase Date</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            { this.cryptoList() }
          </tbody>
        </table>
      </div>
    )
  }
}