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
            nameGameRoom: '',
            isAuthenticated: false,
        }
    }

    async componentDidMount() {
        const adminRef = doc(db, "admins", this.state.idAdmin);
        const adminSnap = await getDoc(adminRef);
        this.setState({
            nameGameRoom: adminSnap.data().gameRoom.name,
            isAuthenticated: adminSnap.data().online
        });

        const q = query(collection(db, "players"), where("gameRoom.id", "==", this.state.idGameRoom));
        onSnapshot(q, (querySnapshot) => {
            var listAllPlayers = [];
            querySnapshot.forEach((doc) => {
                listAllPlayers.push({
                    _id: doc.id,
                    name: doc.data().name,
                    scoreInGame: doc.data().scoreInGame["wolf"]
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
            status: "Started"
        });
    }

    async handleEndGame() {
        document.getElementById("startGame").disabled = false;
        document.getElementById("endGame").disabled = true;
        alert("Game ended!");
        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        // for (let i = 0; i < this.state.listPlayers.length; i++) {
        //     const playerRef = doc(db, "players", this.state.listPlayers[i]._id);
        //     await updateDoc(playerRef, {
        //         stateInGame: "",
        //         gameRoom: null
        //     });
        // }        
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
        // console.log(this.state.listPlayers);
        const playerRef = doc(db, "players", player._id);
        await updateDoc(playerRef, {
            "scoreInGame.wolf": player.scoreInGame
        });
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
            <>
                <div id="main">
                    <h1>Wolf Control Page</h1>
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
                                    <td>{player.scoreInGame}</td>
                                    <td>
                                        <input type={"number"} id={`score-${player._id}`} />
                                        <Button onClick={() => this.handleUpdateScore(player)}>Update Score</Button>
                                    </td>
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

                    <Button id="startGame" onClick={() => this.handleStartGame()}>Start Game</Button>
                    <Button id="endGame" onClick={() => this.handleEndGame()}>End Game</Button>
                    <br />
                    <br />
                    <Button id="logOutButton" onClick={this.handleLogOut}>Log out</Button>
                </div>
            </>
        );
    }
}

function initScore(listPlayers) {
    var noInfection = parseInt(listPlayers.length * 0.15);
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
            stateInGame: "Playing wolf"
        });
        if (indexInfection.includes(index)) {
            await updateDoc(playerRef, {
                "scoreInGame.wolf": -1
            });
        } else {
            await updateDoc(playerRef, {
                "scoreInGame.wolf": 0
            });
        }
    });
}

function calculateScore(score1, score2) {
    var score = score1;

    if (score2 <= -1) {
        score -= 2;
    } else if (score2 >= 1) {
        score += 1;
    } else {
        if (score1 >= 0) {
            score += 1;
        }
    }

    if (score <= -1) score = -1;

    return score;
}

export default WolfControlPage;