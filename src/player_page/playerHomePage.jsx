import React, { Component } from 'react';
import CardComponent from './cardComponent';
import { doc, updateDoc, onSnapshot, collection, query, getDoc } from "firebase/firestore";
import db from '../firebase';

class PlayerHomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: "",
            name: "",
            class: "",
            tel: "",
            isAuthentificated: false,
            listIdGames: [],
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
                isAuthentificated: doc.data().online,
                actualGame: doc.data().gameRoom
            });

            if (doc.data().gameRoom === null) {
                for (let i = 0; i < document.getElementsByClassName("inGameButton btn btn-primary").length; i++) {
                    document.getElementsByClassName("inGameButton").item(i).disabled = false;
                    document.getElementsByClassName("outGameButton").item(i).style.display = "none";
                }
            }
        });
        
        const q = query(collection(db, "gamerooms"));
        onSnapshot(q, (querySnapshot) => {
            var listGameRooms = [];
            querySnapshot.forEach((doc) => {
                listGameRooms.push({
                    id: doc.id
                });
            });
            this.setState({
                listIdGames: listGameRooms
            });
        });
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
        if (!this.state.isAuthentificated) return (<h1>Loading ...</h1>);
        return (
            <React.Fragment>
                <div id="header">

                </div>
                <div id="main">
                    <h2>Hello {this.state.name}</h2>
                    <h2>List of game rooms</h2>
                    <span id="noti"></span><br />
                    {
                        this.state.listIdGames.map((game, i) => <CardComponent key={game.id} idPlayer={this.state._id} idRoom={game.id} actualGame={this.state.actualGame} />)
                    }
                    <button id="logOutButton" onClick={this.handleLogOut}>Log out</button>


                </div>
            </React.Fragment>
        );
    }
}

export default PlayerHomePage;