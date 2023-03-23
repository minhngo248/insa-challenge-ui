import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { doc, onSnapshot, collection, query, updateDoc, orderBy, Timestamp, where, getDocs, addDoc } from "firebase/firestore";
import db from '../firebase';

class BigAdminHomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idAdmin: '',
            listPlayers: [],
            isAuthentificated: false
        };
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        const idAdmin = params.get("id");

        const adminRef = doc(db, "admins", idAdmin);
        onSnapshot(adminRef, (doc) => {
            this.setState({
                idAdmin: doc.id,
                isAuthentificated: doc.data().online
            });
        });

        const q = query(collection(db, "players"), orderBy("score", "desc"));
        onSnapshot(q, (querySnapshot) => {
            var listAllPlayers = [];
            querySnapshot.forEach((doc) => {
                listAllPlayers.push({
                    _id: doc.id,
                    name: doc.data().name,
                    online: doc.data().online,
                    score: doc.data().score,
                    gameRoom: doc.data().gameRoom
                });
            });

            this.setState({
                listPlayers: listAllPlayers
            });
        });
    }

    handleAddPlayerButton = async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const classData = document.getElementById("class").value;
        var telephone = document.getElementById("telephone").value;
        telephone.replace(/ /g, '');
        const q = query(collection(db, "players"), where("tel_number", "==", telephone));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size > 0) {
            alert("This telephone number is already used");
            return;
        }
        if (name === "" || classData === "" || telephone === "") {
            alert("Please fill all the fields");
            return;
        }
        const playerData = {
            name: name,
            class: classData,
            tel_number: telephone,
            score: 0,
            online: false,
            gameRoom: null,
            createdDate: Timestamp.now()
        };
        await addDoc(collection(db, "players"), playerData);
        alert("Player added successfully");
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
                    <h2>Hello admin</h2>
                    <h3>Ranking</h3>
                    <Table striped bordered hover id='tab'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Online</th>
                                <th>Score</th>
                                <th>Game</th>
                            </tr>
                        </thead>
                        <tbody id="tab-body">
                            {
                                this.state.listPlayers.map((player, i) => {
                                    return (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{player.name}</td>
                                            <td>{player.online ? "Yes" : "No"}</td>
                                            <td>{player.score}</td>
                                            <td>{player.gameRoom !== null ? player.gameRoom.name : ""}</td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </Table>

                    <h3>Add a player</h3>
                    <form id="add-player-form">
                        <label htmlFor="name">Name: </label>
                        <input type="text" id="name" name="name" /><br />
                        <label htmlFor="class">Class: </label>
                        <input type="text" id="class" name="class" /><br />
                        <label htmlFor="telephone">Telephone: </label>
                        <input type="text" id="telephone" name="telephone" /><br />
                        <Button id="add-player-button" type="submit" onClick={this.handleAddPlayerButton}>Add</Button><br /><br />
                    </form>


                    <Button id="logOutButton" onClick={this.handleLogOut}>Log out</Button>
                </div>
            </React.Fragment>
        );
    }
}

export default BigAdminHomePage;