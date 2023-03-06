import React, { Component } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

class PlayerHomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: "",
            name: "",
            class: "",
            tel: "",
            listGames: [],
            pressedButton: ""
        };
        this._mounted = false;
    }

    componentDidMount() {
        if (this._mounted) return;
        const params = new URLSearchParams(this.props.location.search);
        const idPlayer = params.get("id");
        var connectionOptions = {
            "force new connection": true,
            "reconnectionAttempts": "Infinity",
            "timeout": 10000,
            "transports": ["websocket"]
        };
        var socket = io.connect('https://insa-challenge.azurewebsites.net', connectionOptions);
        axios.get(`/api/player/${idPlayer}`)
            .then(response => response.data)
            .then(data => {
                this.setState({
                    _id: data._id,
                    name: data.name,
                    class: data.class,
                    tel: data.tel_number
                });
                document.getElementById("namePlayer").innerHTML = data.name;
                const sentData = { _id: data._id, name: data.name, class: data.class, tel_number: data.tel_number };
                socket.emit('sign in', sentData, (res) => {
                    if (res) console.log(res);
                });
            })
            .catch(err => {
                console.log("Error while HTTP get this player " + err);
            });

        axios.get(`/api/gamerooms`)
            .then(response => response.data)
            .then(data => {
                var listG = [];
                data.forEach((d) => {
                    listG.push({ _id: d._id, name: d.name });
                });
                this.setState({
                    listGames: listG
                });
            })
            .catch(err => {
                console.log("Error while HTTP get all game rooms " + err);
            });

        this._mounted = true;
    }

    handleOutGameRoom = () => {
        document.getElementById('noti').innerHTML = "You left the game room";
        document.getElementById('outRoomButton').style.display = "none";
        var connectionOptions = {
            "force new connection": true,
            "reconnectionAttempts": "Infinity",
            "timeout": 10000,
            "transports": ["websocket"]
        };
        var socket = io.connect('https://insa-challenge.azurewebsites.net', connectionOptions);
        const sentData = { roomId: this.state.pressedButton, player: { _id: this.state._id } };
        socket.emit('out room', sentData, () => {
            console.log("Leave success");
        });
        this.setState({
            pressedButton: ""
        });
    }

    handleLogOut() {
        axios.get('/api/logout');
        window.location = '/';
    }

    render() {
        return (
            <React.Fragment>
                <div id="header">

                </div>
                <div id="main">
                    <h2>Hello <span id="namePlayer"></span></h2>
                    <h2>List of game rooms</h2>
                    <ul id="listGames">
                        {
                            this.state.listGames.map((game, i) =>
                                <li><button onClick={() => {
                                    this.setState({
                                        pressedButton: game._id
                                    });
                                    const params = new URLSearchParams(this.props.location.search);
                                    const idPlayer = params.get("id");
                                    const sentData = { roomId: game._id, player: { _id: idPlayer } };
                                    var connectionOptions = {
                                        "force new connection": true,
                                        "reconnectionAttempts": "Infinity",
                                        "timeout": 10000,
                                        "transports": ["websocket"]
                                    };
                                    var socket = io.connect('https://insa-challenge.azurewebsites.net', connectionOptions);
                                    socket.emit('join', sentData, () => {
                                        console.log("Join success");
                                    });
                                    document.getElementById("noti").innerHTML = "You joined the game room";
                                    document.getElementById("outRoomButton").style.display = "block";
                                }
                                }> {game.name} </button></li>
                            )
                        }
                    </ul>
                    <span id="noti"></span><br />
                    <button id="outRoomButton" style={{ display: "none" }} onClick={this.handleOutGameRoom}>Out game room</button><br />
                    <button id="logOutButton" onClick={this.handleLogOut}>Log out</button>


                </div>
            </React.Fragment>
        );
    }
}

export default PlayerHomePage;