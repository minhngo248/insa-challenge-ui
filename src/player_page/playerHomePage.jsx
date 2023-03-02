import React, { Component } from 'react';
import axios from 'axios';

class PlayerHomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            class: "",
            tel: ""
        };
        this._mounted = false;
    }

    componentDidMount() {
        if (this._mounted) return;
        const params = new URLSearchParams(this.props.location.search);
        const idPlayer = params.get("id");
        axios.get(`/api/player/${idPlayer}`)
            .then(response => response.data)
            .then(data => {
                this.setState({
                    name: data.name,
                    class: data.class,
                    tel: data.tel_number
                });
                document.getElementById("namePlayer").innerHTML = data.name;
            })
            .catch(err => {
                console.log("Error while HTTP get this player " + err);
            })
       
        this._mounted = true;
    }

    handleLogOut() {
        axios.get('/api/logout');
        window.location = '/';
    }

    render() {
        return (
            <React.Fragment>
                <div id="main">
                    <h2>Hello <span id="namePlayer"></span></h2>
                    <button id="logOutButton" onClick={this.handleLogOut}>Log out</button>
                </div>
            </React.Fragment>
        );
    }
}

export default PlayerHomePage;