import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import React, { Component } from 'react';
import { doc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import db from '../firebase';

class WolfCardComponent extends Component {
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
    }

    componentDidMount() {
        const gameRoomRef = doc(db, "gamerooms", this.state.idRoom);
        onSnapshot(gameRoomRef, (doc) => {
            this.setState({
                nameRoom: doc.data().name,
                location: doc.data().location,
                nbPlayerIn: doc.data().listPlayers.length,
                maxPlayers: doc.data().maxPlayers,
                linkImg: doc.data().linkImg
            });
        });
    }

    handleAccessGameButton = async () => {
        const gameRoomRef = doc(db, "gamerooms", this.state.idRoom);
        const gameRoomSnap = await getDoc(gameRoomRef);
        const codeAccess = document.getElementById(`inputCode${this.state.idRoom}`).value;
        if (codeAccess !== gameRoomSnap.data().code) {
            alert("Wrong code access");
            return;
        }
        document.getElementById(`inputCode${this.state.idRoom}`).value = "";
        alert(`You joined the game room ${this.state.nameRoom}`);

        // charge data for this component
        const playerRef = doc(db, "players", this.state.idPlayer);
        const playerSnap = await getDoc(playerRef);

        const listPlayersInRoom = gameRoomSnap.data().listPlayers;
        if (listPlayersInRoom.indexOf(this.state.idPlayer) === -1 && playerSnap.data().gameRoom === null) {
            listPlayersInRoom.push(this.state.idPlayer);
            await updateDoc(playerRef, {
                gameRoom: { id: this.state.idRoom, name: this.state.nameRoom },
                stateInGame: "Loading"
            });

            await updateDoc(gameRoomRef, {
                listPlayers: listPlayersInRoom
            });
        }
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

                        <Button id="inGameWolfButton" disabled={false} variant="primary" onClick={() => {
                            document.getElementById(`codeAccessBox${this.state.idRoom}`).style.display = "block";
                        }}> Join </Button>
                    </Card.Body>
                </Card>

                <div id={`codeAccessBox${this.state.idRoom}`} className="codeAccessBox"
                    style={{display: "none"}}>
                    <span>Access code:</span><br />
                    <input type="text" id={`inputCode${this.state.idRoom}`} />
                    <button id="accessRoomButton" onClick={this.handleAccessGameButton}>Validate</button>
                </div>
            </React.Fragment>
        );
    }
}

export default WolfCardComponent;