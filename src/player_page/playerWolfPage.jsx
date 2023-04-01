import React, { Component } from 'react';
import QRCode from "react-qr-code";
import { doc, updateDoc, onSnapshot, collection, query, getDoc } from "firebase/firestore";
import db from '../firebase';

class PlayerWolfPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: "",
            name: "",
            class: "",
            tel: "",
            score: 0,
            isAuthenticated: false,
            listIdGames: [],
            stateInGame: "",
            actualGame: null
        };
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        const idPlayer = params.get("id");

        const playerRef = doc(db, "players", idPlayer);
        onSnapshot(playerRef, (doc) => {
            this.setState({
                _id: doc.id,
                name: doc.data().name,
                class: doc.data().class,
                tel: doc.data().tel_number,
                score: doc.data().score,
                isAuthenticated: doc.data().online,
                stateInGame: doc.data().stateInGame,
                actualGame: doc.data().gameRoom
            });

            if (doc.data().stateInGame === "") {
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
                    <h2 className="Playing">
                        Welcome to the game of WOLF !!
                    </h2>
                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 128, width: "100%" }}>
                        <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value="https://www.google.com"
                        viewBox={`0 0 256 256`}
                        />
                    </div>
                    <button id="logOutButton" onClick={this.handleBack}>Back</button>
                    <button id="logOutButton" onClick={this.handleLogOut}>Log out</button>
                </div>
            </>
        );
    }
}

export default PlayerWolfPage;