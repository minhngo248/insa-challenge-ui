import React, { Component } from 'react';
import axios from 'axios';
import NavBar from '../navBar';

class AdminLogIn extends Component {
    state = {
    }

    handleValiderButton = () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        axios.post('/api/admin', {"username": username, "password": password}, {
            headers: {
                "Content-type": "application/json"
            }
        })
        .then((response) => response.data)
        .then((data) => {
            if (data.result === null) {
                document.getElementById("failedSignIn").innerHTML = "Wrong log in info";
            } else {
                console.log(data.result);
                window.location = `/admin-page?id=${data.result._id}`;
            }
        })
    }

    render() {
        return (
            <React.Fragment>
                <div id="header">
                    <NavBar />
                </div>

                <div id="main">
                    <h2>Admin</h2>
                    <form>
                        <label>Username</label><br />
                        <input type={'text'} name="username" id="username"/><br />
                        <label>Password</label><br />
                        <input type={'password'} name="password" id="password"/>
                    </form>
                    <button type='button' id='validerButton' onClick={this.handleValiderButton}>Valider</button>
                    <div id="failedSignIn"></div>
                </div>
            </React.Fragment>
        );
    }
}

export default AdminLogIn;