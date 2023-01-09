import React, { Component } from 'react';
import axios from 'axios'; //sends hhtp requests from the frontend to backend (server)
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default class EditCrypto extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.onChangePrice = this.onChangePrice.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: '',
      amount: '',
      price: '',
      date: new Date(),
      users: []
    }
  }

  componentDidMount() {
    axios.get('http://localhost:5000/cryptos/'+this.props.match.params.id) //this.props.match.params.id cuz we're getting the ID from the url so were getting the crypto that has that id from the backend
      .then(response => { //as a response it'll return that crypto
        this.setState({ //set the state of username, amount, price, date
          username: response.data.username,
          amount: response.data.amount,
          price: response.data.price,
          date: new Date(response.data.date)
        })   
      })
      .catch(function (error) {
        console.log(error);
      })

    axios.get('http://localhost:5000/users/') //get the users
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            users: response.data.map(user => user.username),
          })
        }
      })
      .catch((error) => {
        console.log(error);
      })

  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onChangeAmount(e) {
    this.setState({
      amount: e.target.value
    })
  }

  onChangePrice(e) {
    this.setState({
      price: e.target.value
    })
  }

  onChangeDate(date) {
    this.setState({
      date: date
    })
  }

  onSubmit(e) {
    e.preventDefault();

    const crypto = {
      username: this.state.username,
      amount: this.state.amount,
      price: this.state.price,
      date: this.state.date
    }

    console.log(crypto);

    axios.post('http://localhost:5000/cryptos/update/' + this.props.match.params.id, crypto) //this.props.match.params.id is just getting the id and were passing in 'crypto'
      .then(res => console.log(res.data));

    window.location = '/';
  }

  render() {
    return (
    <div>
      <h3>Edit Portfolio</h3>
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
          <input type="submit" value="Edit Portfolio" className="btn btn-primary" />
        </div>
      </form>
    </div>
    )
  }
}