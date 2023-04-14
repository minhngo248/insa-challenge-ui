import React, { Component } from 'react';
import QRCode from "react-qr-code";
import { doc, onSnapshot, where } from "firebase/firestore";
import db from '../firebase';
import QRMeetComponent from './QRMeetComponent';

class PlayerWolfPage extends Component {
    constructor(props) {
        super(props);
        const params = new URLSearchParams(this.props.location.search);
        const idPlayer = params.get("id");
        const idGameRoom = params.get("idGr");
        this.state = {
            _id: idPlayer,
            idGameRoom: idGameRoom,
            name: "",
            class: "",
            tel: "",
            score: 0,
            stateInGame: "",
            meetHistory: [],
            isWolf: false,
            showQRScanner: false,
            round: 0,
            wordlist: []
        };
    }

    componentDidMount() {
        const playerRef = doc(db, "players", this.state._id);
        onSnapshot(playerRef, (doc) => {
            if (doc.data().stateInGame === "") {
                alert(`Congratulations! \nYou gained ${this.state.score} points in this game!`);
                window.location = `/player-page?id=${doc.id}`;
            } else {
                this.setState({
                    name: doc.data().name,
                    class: doc.data().class,
                    tel: doc.data().tel_number,
                    score: doc.data().score,
                    stateInGame: doc.data().stateInGame,
                    meetHistory: doc.data().meetHistory,
                    isWolf: doc.data().isWolf,
                });
            }

            if (doc.data().stateInGame === "") {
                window.location = `/player-page?id=${doc.id}`;
            }
        });

        const gameRoomRef = doc(db, "gameRooms", this.state.idGameRoom);
        onSnapshot(gameRoomRef, (doc) => {
            this.setState({
                round: doc.data().round
            });
        });

        const q = doc(db, "wordlists", where("round", "==", this.state.round));
        onSnapshot(q, (doc) => {
            this.setState({
                wordlist: doc.data().wordlist
            });
        });
    }

    handleMeetButton = () => {
        document.getElementById("meetButton").disabled = true;
        document.getElementById("cancelButton").disabled = false;
        document.getElementById("isWolf").style.display = "none";
        document.getElementById("list-word").style.display = "none";
        document.getElementById("meeting-history").style.display = "none";
        this.setState({
            showQRScanner: true
        });
    }

    handleCancelButton = () => {
        document.getElementById("meetButton").disabled = false;
        document.getElementById("cancelButton").disabled = true;
        document.getElementById("isWolf").style.display = "block";
        document.getElementById("list-word").style.display = "block";
        document.getElementById("meeting-history").style.display = "block";
        this.setState({
            showQRScanner: false
        });
    }

    render() {
        return (
            <>
                <div id="main">
                    <h2 className="Playing">
                        Welcome to the game of WOLF !!
                    </h2>
                    <div id="isWolf">
                        {this.state.isWolf
                            ? <h3 className="Playing">You are the WOLF !</h3>
                            : <h3 className="Playing">You are not the WOLF !</h3>
                        }
                    </div>

                    <div id="qr-code">
                        <h3>Your QR Code: </h3>
                        <div style={{ height: "auto", margin: "0 auto", maxWidth: 300, width: "100%" }}>
                            <QRCode
                                size={500}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={this.state._id}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                    </div>

                    <br /><br />
                    <div id="list-word">
                        <h3>List of words: </h3>
                        <ul>
                            {this.state.wordlist.map((item, index) => {
                                return (
                                    <li key={index}>
                                        {item}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div id="meeting-history">
                        <h3>Meeting history: </h3>
                        <ul>
                            {this.state.meetHistory.map((item, index) => {
                                if (item.type === "admin") {
                                    return (
                                        <li key={index}>
                                            {item.time} - You went to the admin room. Your current score is {item.score} vaccine(s).
                                        </li>
                                    );
                                }

                                return (
                                    <li key={index}>
                                        {item.time} - You met {item.name}.
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <br /><br />

                    <button id="meetButton" onClick={this.handleMeetButton}>Meet someone</button>
                    <button id="cancelButton" onClick={this.handleCancelButton}>Cancel</button>
                    {this.state.showQRScanner ?
                        <div id="meetingBox">
                            <QRMeetComponent key={"QRMeet"} idPlayer={this.state._id} limScore={this.state.limScore} />
                        </div> : null}
                </div>
            </>
        );
    }
}

export default PlayerWolfPage;