import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { doc, onSnapshot, updateDoc, where, query, collection, getDoc } from "firebase/firestore";
import db from '../../firebase';

class WolfControlPage extends Component {
    constructor(props) {
        super(props);
        const params = new URLSearchParams(this.props.location.search);
        const idAdmin = params.get("idAd");
        const idGameRoom = params.get("idGr");
        this.state = {
            idAdmin: idAdmin,
            listPlayers: [],
            idGameRoom: idGameRoom,
            nameGameRoom: "",
            isAuthenticated: false,
            status: "",
            round: 0,
            wordlists: []
        }
    }

    async componentDidMount() {
        const adminRef = doc(db, "admins", this.state.idAdmin);
        onSnapshot(adminRef, async (doc) => {
            this.setState({
                nameGameRoom: doc.data().gameRoom.name,
                isAuthenticated: doc.data().online
            });
        });

        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        onSnapshot(gameRoomRef, async (doc) => {
            this.setState({
                status: doc.data().status,
                round: doc.data().round
            });
        });

        const queryWord = query(collection(db, "wordlists"), where("round", "==", this.state.round));
        onSnapshot(queryWord, async (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                this.setState({
                    wordlists: doc.data().wordlists
                });
            });
        });

        const q = query(collection(db, "players"), where("gameRoom.id", "==", this.state.idGameRoom));
        onSnapshot(q, (querySnapshot) => {
            var listAllPlayers = [];
            querySnapshot.forEach((doc) => {
                listAllPlayers.push({
                    _id: doc.id,
                    name: doc.data().name,
                    scoreInGame: doc.data().scoreInGame["wolf"],
                    stateInGame: doc.data().stateInGame
                });
            });

            this.setState({
                listPlayers: listAllPlayers
            });
        });
    }

    async handleStartGame() {
        document.getElementById("startGame").disabled = true;
        document.getElementById("endGame").disabled = false;
        alert("Game started!");
        initScore(this.state.listPlayers);
        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        await updateDoc(gameRoomRef, {
            status: "Started",
            keyword: randomKeyword(this.state.wordlists)
        });
    }

    async handleNextRound() {
        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        await updateDoc(gameRoomRef, {
            round: 2
        });
    }

    async handleContinue() {
        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        await updateDoc(gameRoomRef, {
            status: "Started"
        });
        for (let i = 0; i < this.state.listPlayers.length; i++) {
            const playerRef = doc(db, "players", this.state.listPlayers[i]._id);
            await updateDoc(playerRef, {
                stateInGame: "Playing wolf"
            });
        }
    }

    handleEndGame = async () => {
        document.getElementById("startGame").disabled = false;
        document.getElementById("endGame").disabled = true;
        alert("Game ended!");
        const q = query(collection(db, "players"), where("gameRoom.id", "==", this.state.idGameRoom));
        onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, {
                    stateInGame: "",
                    gameRoom: null,
                    meetHistory: []
                });
            });
        });

        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        await updateDoc(gameRoomRef, {
            status: "Not started",
            listPlayers: []
        });
    }

    async handleUpdateScore(player) {
        const score = document.getElementById(`score-${player._id}`).value;
        if (score === "") return;
        // const oldScore = player.scoreInGame;
        player.scoreInGame = parseInt(score);
        const playerRef = doc(db, "players", player._id);
        await updateDoc(playerRef, {
            "scoreInGame.wolf": player.scoreInGame
        });
    }

    handleEnterScore = async () => {
        for (let i = 0; i < this.state.listPlayers.length; i++) {
            const score = document.getElementById(`score1-${this.state.listPlayers[i]._id}`).value;
            if (score === "") continue;
            const playerRef = doc(db, "players", this.state.listPlayers[i]._id);
            const playerSnap = await getDoc(playerRef);
            var scoreInGame = playerSnap.data().scoreInGame;
            scoreInGame["wolf"] = parseInt(score);
            await updateDoc(playerRef, {
                scoreInGame: scoreInGame
            });

            await updateDoc(playerRef, {
                score: calculateTotalScore(scoreInGame)
            });
        }
    }

    handleLogOut = async () => {
        const adminRef = doc(db, "admins", this.state.idAdmin);
        await updateDoc(adminRef, {
            online: false
        });
        window.location = '/';
    }

    render() {
        if (!this.state.isAuthenticated) return (<h1>Loading ...</h1>);
        return (
            <>
                <div id="main">
                    <h1>Wolf Control Page</h1>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Score</th>
                                <th>Enter Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.listPlayers.map((player, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{player.name}</td>
                                    <td id={`score1-${player._id}`}>{player.scoreInGame}</td>
                                    <td>
                                        <input type={"number"} id={`score-${player._id}`} />
                                        <Button onClick={() => this.handleUpdateScore(player)}>Update Score</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Button onClick={this.handleEnterScore}>Validate the score</Button><br /><br />
                    <Button id="startGame" onClick={() => this.handleStartGame()}>Start Game</Button>
                    <Button id="nextRound" onClick={() => this.handleNextRound()}>Next Round</Button>
                    <Button id="endGame" onClick={this.handleEndGame}>End Game</Button>
                    <br />
                    <br />
                    <Button id="logOutButton" onClick={this.handleLogOut}>Log out</Button>
                </div>
            </>
        );
    }
}

function initScore(listPlayers) {
    var noInfection = parseInt(listPlayers.length * 0.30);
    let indexInfection = [];
    if (noInfection <= 1) noInfection = 1;
    while (indexInfection.length < noInfection) {
        const index = Math.floor(Math.random() * listPlayers.length);
        if (!indexInfection.includes(index)) {
            indexInfection.push(index);
        }
    }

    listPlayers.forEach(async (player, index) => {
        const playerRef = doc(db, "players", player._id);
        await updateDoc(playerRef, {
            stateInGame: "Playing wolf",
            "scoreInGame.wolf": 0
        });
        if (indexInfection.includes(index)) {
            await updateDoc(playerRef, {
                isWolf: true
            });
        } else {
            await updateDoc(playerRef, {
                isWolf: false
            });
        }
    });
}

function calculateTotalScore(scoreInGame) {
    var totalScore = 0;
    for (let key in scoreInGame) {
        totalScore += scoreInGame[key];
    };
    return totalScore;
}

function randomKeyword(listwords) {
    const index = Math.floor(Math.random() * listwords.length);
    return listwords[index];
}

export default WolfControlPage;