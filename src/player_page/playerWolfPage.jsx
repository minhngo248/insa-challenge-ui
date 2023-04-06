import React, { Component } from 'react';
import QRCode from "react-qr-code";
import { doc, onSnapshot } from "firebase/firestore";
import db from '../firebase';
import QRMeetComponent from './QRMeetComponent';

class PlayerWolfPage extends Component {
    constructor(props) {
        super(props);
        const params = new URLSearchParams(this.props.location.search);
        const idPlayer = params.get("id");
        this.state = {
            _id: idPlayer,
            name: "",
            class: "",
            tel: "",
            score: 0,
            listIdGames: [],
            stateInGame: "",
            meetHistory: []
        };
    }

    componentDidMount() {
        const playerRef = doc(db, "players", this.state._id);
        onSnapshot(playerRef, (doc) => {
            this.setState({
                name: doc.data().name,
                class: doc.data().class,
                tel: doc.data().tel_number,
                score: doc.data().score,
                stateInGame: doc.data().stateInGame,
                meetHistory: doc.data().meetHistory
            });

            if (doc.data().stateInGame === "") {
                window.location = `/player-page?id=${doc.id}`;
            }
        });
    }

    handleMeetButton = () => {
        document.getElementById("meetingBox").style.display = "block";
        document.getElementById("meetButton").disabled = true;
    }

    handleCancelButton = () => {
        document.getElementById("meetingBox").style.display = "none";
        document.getElementById("meetButton").disabled = false;
    }

    render() {
        return (
            <>
                <div id="main">
                    <h2 className="Playing">
                        Welcome to the game of WOLF !!
                    </h2>
                    <h3>Your QR Code: </h3>
                    <div style={{ height: "auto", margin: "0 auto", maxWidth: 300, width: "100%" }}>
                        <QRCode
                            size={500}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={this.state._id}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <h3>Meeting history: </h3>
                    <ul>
                        {this.state.meetHistory.map((item, index) => {
                            return (
                                <li key={index}>
                                    {item.time} - {item.name}
                                </li>
                            );
                        })}
                    </ul>
                    <br/><br/>

                    <button id="meetButton" onClick={this.handleMeetButton}>Meet someone</button>
                    <button id="cancelButton" onClick={this.handleCancelButton}>Cancel</button>
                    <div id="meetingBox" style={{ display: "none" }}>
                        <QRMeetComponent key={"QRMeet"} idPlayer={this.state._id}/>
                    </div>
                </div>
            </>
        );
    }
}

export default PlayerWolfPage;