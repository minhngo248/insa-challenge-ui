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
            isAuthentificated: false
        };
    }

    async componentDidMount() {
        const adminRef = doc(db, "admins", this.state.idAdmin);
        const adminSnap = await getDoc(adminRef);
        this.setState({
            nameGameRoom: adminSnap.data().gameRoom.name,
            isAuthentificated: adminSnap.data().online
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

    handleKickOutButton = async () => {
        for (let i = 0; i < this.state.listPlayers.length; i++) {
            const checkBox = document.getElementById(`checkBox-${this.state.listPlayers[i]._id}`);
            if (checkBox.checked) {
                const playerRef = doc(db, "players", this.state.listPlayers[i]._id);
                await updateDoc(playerRef, {
                    gameRoom: null
                });
            }
        }
        const gameRoomRef = doc(db, "gamerooms", this.state.idGameRoom);
        var listIdPlayers = this.state.listPlayers.map(player => player._id);
        await updateDoc(gameRoomRef, {
            listPlayers: listIdPlayers
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
        if (!this.state.isAuthentificated) return (<h1>Loading ...</h1>);
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
                                    <td><input type="checkbox" id={`checkBox-${player._id}`} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Button onClick={this.handleEnterScore}>Validate the score</Button>   <Button onClick={this.handleKickOutButton}>Kick out</Button><br /><br />
                    <Button id="logOutButton" onClick={this.handleLogOut}>Log out</Button>
                </div>
            </React.Fragment>
        );
    }
}

export default AdminGamePage;