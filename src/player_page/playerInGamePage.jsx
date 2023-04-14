import React, { Component } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
import db from '../firebase';

class PlayerInGamePage extends Component {
    constructor(props) {
        super(props);
        const params = new URLSearchParams(this.props.location.search);
        const idPlayer = params.get("id");
        this.state = {
            _id: idPlayer,
            name: "",
            score: 0,
            isAuthenticated: false,
            stateInGame: "",
            actualGame: {}
        };
    }

    componentDidMount() {
        const playerRef = doc(db, "players", this.state._id);
        // var score = this.state.score;
        // var game = this.state.actualGame;
        onSnapshot(playerRef, async (doc) => {
            if (doc.data().stateInGame === "") {
                alert(`Congratulations! \nYou gained ${this.state.score} points in this game!`);
                window.location = `/player-page?id=${doc.id}`;
            } else {
                this.setState({
                    name: doc.data().name,
                    score: doc.data().scoreInGame[doc.data().gameRoom["name"].toLowerCase()],
                    isAuthenticated: doc.data().online,
                    stateInGame: doc.data().stateInGame,
                    actualGame: doc.data().gameRoom
                });
            }
            // if (doc.data().stateInGame === "") {
            //     alert(`Congratulations! \nYou won the game!`);
            //     window.location = `/player-page?id=${doc.id}`;
            if (doc.data().stateInGame === "Playing wolf") {
                window.location = `/player-wolf-page?id=${doc.id}&idGr=KCx0sRAZpccfwWhjK0ih`;
            }
        });
    }

    // handleBack = async () => {
    //     const playerRef = doc(db, "players", this.state._id);
    //     const playerSnap = await getDoc(playerRef);
    //     if (playerSnap.data().gameRoom !== null) {
    //         const gameRoomRef = doc(db, "gamerooms", playerSnap.data().gameRoom.id);
    //         const gameRoomSnap = await getDoc(gameRoomRef);
    //         var listPlayersInRoom = gameRoomSnap.data().listPlayers;
    //         listPlayersInRoom = listPlayersInRoom.filter(playerId => playerId !== playerSnap.id);
    //         await updateDoc(gameRoomRef, {
    //             listPlayers: listPlayersInRoom
    //         });
    //         await updateDoc(playerRef, {
    //             gameRoom: null,
    //             stateInGame: ""
    //         });
    //     }
    // }

    render() {
        if (!this.state.isAuthenticated) return (<h1>Loading ...</h1>);
        return (
            <>
                <div id="main">
                    <h1>Welcome {this.state.name}!</h1>
                    <h1>You are playing the game of {this.state.actualGame["name"]}</h1>
                    {/* <button id="backButton" onClick={this.handleBack}>Back</button> */}
                </div>
            </>
        );
    }
}

export default PlayerInGamePage;