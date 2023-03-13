import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import io from 'socket.io-client';
import axios from 'axios';
import React, { Component } from 'react';

class CardComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idPlayer: this.props.idPlayer,
            idRoom: this.props.idRoom,
            nameRoom: '',
            location: '',
            nbPlayerIn: 0,
            maxPlayers: 0,
            linkImg: ''
        };
        this._mouted = false;
    }

    componentDidMount() {
        if (this._mouted) return;
        axios.get(`/api/gamerooms/${this.state.idRoom}`)
            .then(response => response.data)
            .then(data => {
                this.setState({
                    nameRoom: data.name,
                    location: data.location,
                    nbPlayer: data.listPlayers.length,
                    maxPlayers: data.maxPlayers,
                    linkImg: data.linkImg
                });
            })
            .catch(err => {
                console.log("Error while HTTP get this game room " + err);
            });
        this._mouted = true;
    }

    handleOutGameRoom = () => {
        document.getElementById('noti').innerHTML = "You left the game room";
        document.getElementById(`outRoomButton${this.state.nameRoom}`).style.display = "none";
        for (let i = 0; i < document.getElementsByClassName("inGameButton btn btn-primary").length; i++) {
            document.getElementsByClassName("inGameButton").item(i).disabled = false;
        }
        var connectionOptions = {
            "force new connection": true,
            "reconnectionAttempts": "Infinity",
            "timeout": 10000,
            "transports": ["websocket"]
        };
        var socket = io.connect('https://insa-challenge.azurewebsites.net', connectionOptions);
        const sentData = { roomId: this.state.idRoom, player: { _id: this.state.idPlayer } };
        socket.emit('out room', sentData, () => {
            console.log("Leave success");
        });
    }

    render() {
        return (
            <React.Fragment>
                <Card style={{ width: '18rem' }}>
                    <Card.Img variant="top" src={this.state.linkImg} />
                    <Card.Body>
                        <Card.Title>{this.state.nameRoom}</Card.Title>
                        <Card.Text>
                            <span>Location: {this.state.location}</span><br />
                            <span>Player in this room: {this.state.nbPlayerIn}</span><br />
                            <span>Max players: {this.state.maxPlayers}</span><br />
                        </Card.Text>

                        <Button className="inGameButton" disabled={false} variant="primary" onClick={() => {
                            const sentData = { roomId: this.state.idRoom, player: { _id: this.state.idPlayer } };
                            var connectionOptions = {
                                "force new connection": true,
                                "reconnectionAttempts": "Infinity",
                                "timeout": 10000,
                                "transports": ["websocket"]
                            };
                            var socket = io.connect('https://insa-challenge.azurewebsites.net', connectionOptions);
                            socket.emit('join', sentData, (res, err) => {
                                if (res) {
                                    document.getElementById("noti").innerHTML = `You joined the game room ${this.state.nameRoom}`;
                                    document.getElementById(`outRoomButton${this.state.nameRoom}`).style.display = "block";
                                    for (let i = 0; i < document.getElementsByClassName("inGameButton").length; i++) {
                                        document.getElementsByClassName("inGameButton").item(i).disabled = true;
                                    }
                                }
                                if (err) {
                                    document.getElementById("noti").innerHTML = `You cannot join the game room ${this.state.nameRoom}`;
                                }
                            });

                        }
                        }> Join </Button>
                    </Card.Body>
                </Card>

                <button id={`outRoomButton${this.state.nameRoom}`} style={{ display: "none" }} onClick={this.handleOutGameRoom}>Out game room</button><br />
            </React.Fragment>
        );
    }
}

export default CardComponent;
