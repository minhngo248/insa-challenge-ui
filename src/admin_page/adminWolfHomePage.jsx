import axios from 'axios';
import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';
import { io } from 'socket.io-client';

class AdminWolfHomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idAdmin: '',
            tabContent: []
        };
        var connectionOptions = {
            withCredentials: true,
            transports: ["polling"]
        };
        // this.socket = io('https://insa-challenge.azurewebsites.net', connectionOptions);
        this.socket = io('http://localhost:8080', connectionOptions);

        this._mounted = false;
    }

    componentDidMount() {
        if (this._mounted) return;
        const params = new URLSearchParams(this.props.location.search);
        const idAdmin = params.get("id");
        axios.get(`/api/admin/${idAdmin}`)
            .then(response => response.data)
            .then(data => {
                this.setState({
                    idAdmin: data._id
                });
                this.socket.emit('big admin sign in', () => {
                    console.log("Admin signed in successfully");
                });
            })
            .catch(err => {
                console.log("error while parsing admin page " + err);
            })

        axios.get('/api/players')
            .then(response => response.data)
            .then(data => {
                var tabBody = document.getElementById('tab-body');
                data.map((player, i) => {
                    var trElem = document.createElement('tr');
                    var orderElem = document.createElement('td');
                    orderElem.innerHTML = i + 1;
                    trElem.append(orderElem);
                    var nameElem = document.createElement('td');
                    nameElem.innerHTML = player.name;
                    trElem.append(nameElem);
                    var onlineElem = document.createElement('td');
                    onlineElem.innerHTML = player.online;
                    trElem.append(onlineElem);
                    var scoreElem = document.createElement('td');
                    scoreElem.innerHTML = player.score;
                    trElem.append(scoreElem);
                    var gameRoomElem = document.createElement('td');
                    if (player.gameRoom !== null) {
                        gameRoomElem.innerHTML = player.gameRoom.name;
                    }
                    trElem.append(gameRoomElem);
                    tabBody.append(trElem);
                });
                this.setState({
                    tabContent: data
                });
            });
        this._mounted = true;
    }

    componentDidUpdate() {
        this.socket.on("update data", async () => {
            console.log("AAA updated");
            await axios.get('/api/players')
                .then(response => response.data)
                .then(data => {
                    if (JSON.stringify(data) !== JSON.stringify(this.state.tabContent)) {
                        var tabB = document.getElementById('tab-body');
                        tabB.remove();
                        var tabBody = document.createElement("tbody");
                        tabBody.id = "tab-body";
                        data.map((player, i) => {
                            var trElem = document.createElement('tr');
                            var orderElem = document.createElement('td');
                            orderElem.innerHTML = i + 1;
                            trElem.append(orderElem);
                            var nameElem = document.createElement('td');
                            nameElem.innerHTML = player.name;
                            trElem.append(nameElem);
                            var onlineElem = document.createElement('td');
                            onlineElem.innerHTML = player.online;
                            trElem.append(onlineElem);
                            var scoreElem = document.createElement('td');
                            scoreElem.innerHTML = player.score;
                            trElem.append(scoreElem);
                            var gameRoomElem = document.createElement('td');
                            if (player.gameRoom !== null) {
                                gameRoomElem.innerHTML = player.gameRoom.name;
                            }
                            trElem.append(gameRoomElem);
                            tabBody.append(trElem);
                        });
                        var tab = document.getElementById('tab');
                        tab.append(tabBody);
                        this.setState({
                            tabContent: data
                        });
                    }
                });
        });
    }

    handleLogOut = () => {
        axios.get("/api/logout/admin");
        this.socket.emit("big admin log out");
        window.location = '/';
    }

    render() {
        return (
            <React.Fragment>
                <div id="main">
                    <h2>Hello admin Wolf !</h2>
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
                        </tbody>
                    </Table>

                    <Button id="logOutButton" onClick={this.handleLogOut}>Log out</Button>
                </div>
            </React.Fragment>
        );
    }
}

export default AdminWolfHomePage;