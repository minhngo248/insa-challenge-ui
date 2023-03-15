import axios from 'axios';
import React, { Component } from 'react';
import Table from 'react-bootstrap/Table';
import { Button } from 'react-bootstrap';

class AdminHomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAuthenticated: false,
            idAdmin: '',
            tabContent: []
        };
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
                    isAuthenticated: true,
                    idAdmin: data._id
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

    handleChange = () => {
        axios.get('/api/players')
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
    }

    render() {
        if (!this.state.isAuthenticated) return (<h2>Admin not found</h2>);
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
                                <th>Game</th>
                            </tr>
                        </thead>
                        <tbody id="tab-body">
                        </tbody>
                    </Table>

                    <Button onClick={this.handleChange}>Update table</Button>
                </div>
            </React.Fragment>
        );
    }
}

export default AdminHomePage;