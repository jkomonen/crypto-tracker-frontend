import React, { Component } from 'react';
import axios from 'axios'; //sends hhtp requests from the frontend to backend (server)

export default class CreateUser extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: ''
    }
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    })
  }

  onSubmit(e) {
    e.preventDefault();

    const user = {
      username: this.state.username
    }

    console.log(user);

    axios.post('http://localhost:5000/users/add', user) //sends an http post request to the backend endpoint at that url. users.js is a backend file and received the username and saves it in the database
      .then(res => console.log(res.data));

    this.setState({ //set back to nothing so they can enter another username after submitting
      username: '' 
    })
  }

  render() {
    return (
      <div>
        <h3>Add New Cryptocurrency</h3>
        <form onSubmit={this.onSubmit}>
          <div className="form-group"> 
            {/* <label>Cryptocurrency: </label> */}
            <label></label>
            <input  type="text"
                required
                className="form-control"
                value={this.state.username}
                onChange={this.onChangeUsername}
                />
          </div>
          <div className="form-group">
            <input type="submit" value="Add New Cryptocurrency" className="btn btn-primary" />
          </div>
        </form>
      </div>
    )
  }
}