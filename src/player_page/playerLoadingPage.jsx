import React, { Component } from 'react';
import { doc, updateDoc, onSnapshot, collection, query, getDoc } from "firebase/firestore";
import db from '../firebase';

class PlayerLoadingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: "",
            name: "",
            score: 0,
            isAuthenticated: false,
            stateInGame: "",
            actualGame: null
        };
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        const idPlayer = params.get("idAd");

        const playerRef = doc(db, "players", idPlayer);
        onSnapshot(playerRef, (doc) => {
            this.setState({
                _id: doc.id,
                name: doc.data().name,
                score: doc.data().score,
                isAuthenticated: doc.data().online,
                stateInGame: doc.data().stateInGame,
                actualGame: doc.data().gameRoom
            });

            if (doc.data().stateInGame == "") {
                window.location = `/player-page?id=${doc.id}`;
            }
        });
        
    }

    handleBack = async () => {
        const playerRef = doc(db, "players", this.state._id);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.data().gameRoom !== null) {
            const gameRoomRef = doc(db, "gamerooms", playerSnap.data().gameRoom.id);
            const gameRoomSnap = await getDoc(gameRoomRef);
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
        // window.location = '/player-home-page';
    }

    handleLogOut = async () => {
        const playerRef = doc(db, "players", this.state._id);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.data().gameRoom !== null) {
            const gameRoomRef = doc(db, "gamerooms", playerSnap.data().gameRoom.id);
            const gameRoomSnap = await getDoc(gameRoomRef);
            var listPlayersInRoom = gameRoomSnap.data().listPlayers;
            listPlayersInRoom = listPlayersInRoom.filter(playerId => playerId !== playerSnap.id);
            await updateDoc(gameRoomRef, {
                listPlayers: listPlayersInRoom
            });
            await updateDoc(playerRef, {
                gameRoom: null
            });
        }
        // Set the "online" field of the current player to false
        await updateDoc(playerRef, {
            online: false
        });
        window.location = '/';
    }

    render() {
        if (!this.state.isAuthenticated) return (<h1>Loading ...</h1>);
        return (
            <>
                <div id="main">
                    <h1>Hello {this.state.name}</h1>
                    <p>
                    <span>Your score: {this.state.score}</span><br />
                    </p>
                    <h1>Game room: {this.state.actualGame.name}</h1>
                    <h2 className="Loading">
                        Waiting for all players to join...
                    </h2>
                    <button id="logOutButton" onClick={this.handleBack}>Back</button>
                    <button id="logOutButton" onClick={this.handleLogOut}>Log out</button>
                </div>
            </>
        )
    }
}

export default PlayerLoadingPage;