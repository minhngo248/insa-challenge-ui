import Card from 'react-bootstrap/Card';
import React, { Component } from 'react';
import { doc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import db from '../firebase';

class CardComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idPlayer: this.props.idPlayer,
            idRoom: this.props.idRoom,
            actualGame: this.props.actualGame,
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
        if (this.state.actualGame === null) return;
        if (this.state.actualGame.id === this.state.idRoom) {
            document.getElementById(`outRoomButton${this.state.idRoom}`).style.display = "block";
            document.getElementById("inGameButton").disabled = true;
        }
    }

    handleOutGameRoom = async () => {
        document.getElementById(`outRoomButton${this.state.idRoom}`).style.display = "none";
        document.getElementById("inGameButton").disabled = false;

        // charge data for this component
        const gameRoomRef = doc(db, "gamerooms", this.state.idRoom);
        const gameRoomSnap = await getDoc(gameRoomRef);
        const playerRef = doc(db, "players", this.state.idPlayer);
        const playerSnap = await getDoc(playerRef);

        var listPlayersInRoom = gameRoomSnap.data().listPlayers;
        listPlayersInRoom = listPlayersInRoom.filter(playerId => playerId !== playerSnap.id);
        await updateDoc(gameRoomRef, {
            listPlayers: listPlayersInRoom
        });
        await updateDoc(playerRef, {
            gameRoom: null,
            stateInGame: ""
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
                    </Card.Body>
                </Card>

                <button className="outGameButton" id={`outRoomButton${this.state.idRoom}`} style={{ display: "none" }} onClick={this.handleOutGameRoom}>Out game room</button><br />
            </React.Fragment>
        );
    }
}

export default CardComponent;
