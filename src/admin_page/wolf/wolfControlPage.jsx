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
                    scoreInGame: doc.data().scoreInGame["wolf"],
                    // history: [],
                });
            });
    
            this.setState({
                listPlayers: listAllPlayers
            });
        });
    }

    async handleStartGame() {
        await initScore(this.state.listPlayers);
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

    async handleUpdateHistory(player) {
        // const playerRef = doc(db, "players", player._id);
        // console.log(player.historyWolf);
        // const history = [...player.historyWolf, player.scoreWolf];
        // await updateDoc(playerRef, {
            // historyWolf: [...player.historyWolf, {"player.scoreWolf": 4}],
        //     historyWolf: []
        // });
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
                                <th>Update history</th>
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
                                    <td>
                                        <Button onClick={() => this.handleUpdateHistory(player)}>Update History</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    
                    <Button id="Start Game" onClick={() => this.handleStartGame()}>Start Game</Button>
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
            stateInGame: "Playing"
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