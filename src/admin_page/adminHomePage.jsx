import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { doc, onSnapshot, collection, query, updateDoc } from "firebase/firestore";
import db from '../firebase';

class AdminHomePage extends Component {
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

        const q = query(collection(db, "players"));
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

    handleLogOut = async () => {
        const adminRef = doc(db, "admins", this.state.idAdmin);
        // set online to false
        await updateDoc(adminRef, {
            online: false
        });
        window.location = '/';
    }

    render() {
        if (!this.state.isAuthentificated) return (<h1>Not found</h1>);
        return (
            <React.Fragment>
                <div id="main">
                    <h2>Hello admin</h2>
                    <h3>List all players</h3>
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

                    <Button id="logOutButton" onClick={this.handleLogOut}>Log out</Button>
                </div>
            </React.Fragment>
        );
    }
}

export default AdminHomePage;