import React, { Component } from 'react';
import CardComponent from './cardComponent';
import { doc, updateDoc, onSnapshot, collection, query, getDoc } from "firebase/firestore";
import db from '../firebase';
import QRAccessGame from './QRAccessGame';
import { Button } from 'react-bootstrap';
import WolfCardComponent from './wolfCardComponent';

class PlayerHomePage extends Component {
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
            idWolfGame: "",
            stateInGame: "",
            actualGame: null,
            stateFinalGame: false
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
                actualGame: doc.data().gameRoom,
                stateFinalGame: doc.data().stateFinalGame
            });

            if (doc.data().gameRoom === null) {
                document.getElementById("inGameButton").disabled = false;
                for (let i = 0; i < document.getElementsByClassName("outGameButton").length; i++) {
                    document.getElementsByClassName("outGameButton").item(i).style.display = "none";
                }
            }
            if (doc.data().stateInGame === "Loading") {
                window.location = `/player-loading-page?idAd=${doc.id}`;
            }
        });

        const q = query(collection(db, "gamerooms"));
        onSnapshot(q, (querySnapshot) => {
            var listGameRooms = [];
            var idGameWolf = "";
            querySnapshot.forEach((doc) => {
                if (doc.data().name === "Wolf") {
                    idGameWolf = doc.id;
                }
                else {
                    listGameRooms.push({
                        id: doc.id
                    });
                }
            });
            this.setState({
                listIdGames: listGameRooms,
                idWolfGame: idGameWolf
            });
        });
    }

    handleCancelButton = async () => {
        document.getElementById("inGameButton").disabled = false;
        document.getElementById(`codeAccessBox`).style.display = "none";
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
                gameRoom: null,
                stateInGame: ""
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
            <React.Fragment>
                <div id="header">

                </div>
                <div id="main">
                    <h2>Hello {this.state.name}</h2>
                    <p>
                        <span>Your score: {this.state.score}</span><br />
                    </p>

                    <div id={`codeAccessBox`} className="codeAccessBox" style={{ display: "none" }}>
                        <span>Scan QR Code to access game:</span><br />
                        <QRAccessGame key={`QRAccess`} idPlayer={this.state._id} />
                        <br />
                        <button id={`cancelButton`} onClick={this.handleCancelButton}>Cancel</button>
                    </div>

                    <h2>List of game rooms</h2>
                    {this.state.stateFinalGame
                        ? <WolfCardComponent key={"wolfRoom"} idPlayer={this.state._id} idRoom={this.state.idWolfGame}/>
                        : <>
                        <Button id="inGameButton" disabled={false} variant="primary" onClick={() => {
                            document.getElementById(`codeAccessBox`).style.display = "block";
                            document.getElementById("inGameButton").disabled = true;
                        }}> Join </Button>
                        {
                            this.state.listIdGames.map((game, i) => <CardComponent key={game.id} idPlayer={this.state._id} idRoom={game.id} actualGame={this.state.actualGame} />)
                        }
                        </>
                    }
                    {/* <Button id="inGameButton" disabled={false} variant="primary" onClick={() => {
                        document.getElementById(`codeAccessBox`).style.display = "block";
                        document.getElementById("inGameButton").disabled = true;
                    }}> Join </Button>
                    {
                        this.state.listIdGames.map((game, i) => <CardComponent key={game.id} idPlayer={this.state._id} idRoom={game.id} actualGame={this.state.actualGame} />)
                    }
                    <WolfCardComponent key={"wolfRoom"} idPlayer={this.state._id} idRoom={this.state.idWolfGame}/> */}
                    <br/><br/><br/>
                    <button id="logOutButton" onClick={this.handleLogOut}>Log out</button>
                </div>
            </React.Fragment>
        );
    }
}

export default PlayerHomePage;