import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { doc, onSnapshot, updateDoc, where, query, collection, getDoc } from "firebase/firestore";
import db from '../firebase';

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

        const q = query(collection(db, "players"), where("gameRoom.id", "==", this.state.idGameRoom));
        onSnapshot(q, (querySnapshot) => {
            var listAllPlayers = [];
            querySnapshot.forEach((doc) => {
                listAllPlayers.push({
                    _id: doc.id,
                    name: doc.data().name,
                    score: doc.data().score
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

    handleEnterScore = async () => {
        for (let i = 0; i < this.state.listPlayers.length; i++) {
            const score = document.getElementById(`score-${this.state.listPlayers[i]._id}`).value;
            if (score === "") continue;
            const playerRef = doc(db, "players", this.state.listPlayers[i]._id);
            await updateDoc(playerRef, {
                score: parseInt(score)
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
                    <Button id="logOutButton" onClick={this.handleLogOut}>Log out</Button>
                </div>
            </React.Fragment>
        );
    }
}

export default AdminGamePage;