import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { doc, onSnapshot, updateDoc, where, query, collection, getDoc } from "firebase/firestore";
import db from '../firebase';
import QRCode from 'react-qr-code';

class AdminGamePage extends Component {
    constructor(props) {
        super(props);
        const params = new URLSearchParams(this.props.location.search);
        const idAdmin = params.get("idAd");
        const idGameRoom = params.get("idGr");
        this.state = {
            idAdmin: idAdmin,
            listPlayers: [],
            idGameRoom: idGameRoom,
            nameGameRoom: '',
            isAuthenticated: false
        };
    }

    async componentDidMount() {
        const adminRef = doc(db, "admins", this.state.idAdmin);
        const adminSnap = await getDoc(adminRef);
        this.setState({
            nameGameRoom: adminSnap.data().gameRoom.name,
            isAuthenticated: adminSnap.data().online
        });

        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        onSnapshot(gameRoomRef, (doc) => {
            this.setState({
                status: doc.data().status
            });
        });

        const q = query(collection(db, "players"), where("gameRoom.id", "==", this.state.idGameRoom));
        onSnapshot(q, (querySnapshot) => {
            var listAllPlayers = [];
            querySnapshot.forEach((doc) => {
                listAllPlayers.push({
                    _id: doc.id,
                    name: doc.data().name,
                    score: doc.data().scoreInGame[this.state.nameGameRoom.toLowerCase()],
                });
            });

            this.setState({
                listPlayers: listAllPlayers
            });
        });
    }

    handleStartGame = async () => {
        document.getElementById("startGame").disabled = true;
        document.getElementById("endGame").disabled = false;
        alert("Game started!");
        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        await updateDoc(gameRoomRef, {
            status: "Started"
        });
        for (let i = 0; i < this.state.listPlayers.length; i++) {
            const playerRef = doc(db, "players", this.state.listPlayers[i]._id);
            await updateDoc(playerRef, {
                stateInGame: "Playing"
            });
        }
    }

    handleEndGame = async () => {
        document.getElementById("startGame").disabled = false;
        document.getElementById("endGame").disabled = true;
        alert("Game ended!");

        const q = query(collection(db, "players"), where("gameRoom.id", "==", this.state.idGameRoom));
        onSnapshot(q, async (querySnapshot) => {
            querySnapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, {
                    stateInGame: "",
                    gameRoom: null
                });
            });
        });
        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        await updateDoc(gameRoomRef, {
            status: "Not started",
            listPlayers: []
        });
    }

    handleEnterScore = async () => {
        for (let i = 0; i < this.state.listPlayers.length; i++) {
            const score = document.getElementById(`score-${this.state.listPlayers[i]._id}`).value;
            if (score === "") continue;
            const playerRef = doc(db, "players", this.state.listPlayers[i]._id);
            const playerSnap = await getDoc(playerRef);
            var scoreInGame = playerSnap.data().scoreInGame;
            scoreInGame[`${this.state.nameGameRoom.toLowerCase()}`] = parseInt(score);
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
        // set online to false
        await updateDoc(adminRef, {
            online: false
        });
        window.location = '/';
    }

    render() {
        if (!this.state.isAuthenticated) return (<h1>Loading ...</h1>);
        return (
            <React.Fragment>
                <div id="main">
                    <h1>Game Room {this.state.nameGameRoom}</h1>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Score</th>
                                <th>Enter the score</th>
                                <th>Kick out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.listPlayers.map((player, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{player.name}</td>
                                    <td>{player.score}</td>
                                    <td><input type={"number"} id={`score-${player._id}`} /></td>
                                    <td><Button onClick={async () => {
                                        const playerRef = doc(db, "players", player._id);
                                        await updateDoc(playerRef, {
                                            gameRoom: null,
                                            stateInGame: ""
                                        });
                                        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
                                        await updateDoc(gameRoomRef, {
                                            listPlayers: this.state.listPlayers.map(player => player._id)
                                        });
                                    }}>Kick out</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Button onClick={this.handleEnterScore}>Validate the score</Button><br /><br />
                    <Button id={"startGame"} onClick={this.handleStartGame}>Start Game</Button>
                    <Button id={"endGame"} onClick={this.handleEndGame}>End Game</Button>
                    <br />
                    <br />
                    <h1>QR Code to access game for players</h1>
                    {
                        <div style={{ height: "auto", margin: "0 auto", maxWidth: 300, width: "100%" }}>
                            <QRCode
                                size={500}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={process.env[`REACT_APP_${this.state.idGameRoom}`]}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                    }
                    <br />
                    <br />
                    <Button id="logOutButton" onClick={this.handleLogOut}>Log out</Button>
                </div>
            </React.Fragment>
        );
    }
}

function calculateTotalScore(scoreInGame) {
    var totalScore = 0;
    for (let key in scoreInGame) {
        //if (key !== "wolf") {
        totalScore += scoreInGame[key];
        //}
    };
    return totalScore;
}

export default AdminGamePage;