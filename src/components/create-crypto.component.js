//this will allow us to add exercises into the database

import React, { Component } from 'react';
import axios from 'axios'; //sends hhtp requests from the frontend to backend (server)
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default class CreateCrypto extends Component {
  constructor(props) {
    super(props); //need to call super when defining the constructor of a subclass. all react component classes that have a constructor start with a super props call

    //idrk but we want 'this' to refer to the right thing
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.onChangePrice = this.onChangePrice.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);


    //we'll set the initial state of the component by assigning an object to this.state
    //need to create properties that correspond to the fields of the mongodb document
    //state is how u create variable in react. instead of let name = "josh". create everything in state so when you update the state, the page will auto update
    this.state = {
      username: '',
      amount: '',
      price: '',
      date: new Date(),
      users: [] //users here cuz there will be a dropdown menu where you can select allthe users that are in the database
    }
  }


  //this is a react lifecycle method. componentDidMount() will auto be called right before anything displays on the page
  //were coding the dropdown menu
  componentDidMount() {
    axios.get('http://localhost:5000/users/')
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            users: response.data.map(user => user.username), //loops through each object and gets the username
            username: response.data[0].username //username is auto set to the first username in the database
          })
        }
      })
      .catch((error) => {
        console.log(error);
      })

  }


  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
  //~~~METHODS TO UPDATE STATE PROPERTIES~~~//
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  //update username
  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  //update amount
  onChangeAmount(e) {
    this.setState({
      amount: e.target.value
    })
  }

  //update price
  onChangePrice(e) {
    this.setState({
      price: e.target.value
    })
  }

  //update date
  onChangeDate(date) {
    this.setState({
      date: date
    })
  }

  //when they click the submit button
  onSubmit(e) {
    e.preventDefault(); //prevent default html form submit from taking place

    const crypto = {
      username: this.state.username,
      amount: this.state.amount,
      price: this.state.price,
      date: this.state.date
    }

    console.log(crypto);

    axios.post('http://localhost:5000/cryptos/add', crypto)
      .then(res => console.log(res.data));

    window.location = '/'; //take user back to homepage after submitting
  }

  render() {
    return (
    <div>
      <h3>Add To Portfolio</h3>
      <form onSubmit={this.onSubmit}>
        <div className="form-group"> 
          <label>Cryptocurrency: </label>
          <select ref="userInput"
              required
              className="form-control"
              value={this.state.username}
              onChange={this.onChangeUsername}>
              {
                this.state.users.map(function(user) {
                  return <option 
                    key={user}
                    value={user}>{user}
                    </option>;
                })
              }
          </select>
        </div>
        <div className="form-group"> 
          <label>Amount Purchased: </label>
          <input  type="text"
              required
              className="form-control"
              value={this.state.amount}
              onChange={this.onChangeAmount}
              />
        </div>
        <div className="form-group">
          <label>Price: </label>
          <input 
              type="text" 
              className="form-control"
              value={this.state.price}
              onChange={this.onChangePrice}
              />
        </div>
        <div className="form-group">
          <label>Purchase Date: </label>
          <div>
            <DatePicker
              selected={this.state.date}
              onChange={this.onChangeDate}
            />
          </div>
        </div>

        <div className="form-group">
          <input type="submit" value="Add To Portfolio" className="btn btn-primary" />
        </div>
      </form>
    </div>
    )
  }
}