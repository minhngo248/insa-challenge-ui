import React, { Component } from 'react';
import QrReader from 'modern-react-qr-reader';
import { doc, updateDoc, getDoc, query, collection, onSnapshot } from "firebase/firestore";
import db from '../firebase';
import sha256 from 'crypto-js/sha256';

class QRAccessGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idRoom: '',
            idPlayer: this.props.idPlayer
        };
        this.handleError = this.handleError.bind(this);
    }

    handleScan = data => {
        if (data !== '' && data !== null) {
            var hashData = sha256(data);
            hashData = hashData.toString();
            const q = query(collection(db, "gamerooms"));
            onSnapshot(q, (querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if (doc.data().code === hashData) {
                        this.setState({
                            idRoom: doc.id
                        });
                        this.handleJoinRoom();
                        return;
                    }
                });
            });
        }
    }

    handleJoinRoom = async () => {
        // charge data for this component
        const playerRef = doc(db, "players", this.state.idPlayer);
        const playerSnap = await getDoc(playerRef);
        const gameRoomRef = doc(db, "gamerooms", this.state.idRoom);
        const gameRoomSnap = await getDoc(gameRoomRef);
        const nameRoom = gameRoomSnap.data().name;
        // if (gameRoomSnap.data().status === "Started") {
        //     van bi bug ///////////////////
        //     alert("This game has already started");	
        //     return;
        // }
        const listPlayersInRoom = gameRoomSnap.data().listPlayers;
        // if (listPlayersInRoom.length === gameRoomSnap.data().maxPlayers) {
        //     van bi bug ////////////////
        //     alert("This game is full");
        //     return;
        // }
        if (listPlayersInRoom.indexOf(this.state.idPlayer) === -1 && playerSnap.data().gameRoom === null) {
            listPlayersInRoom.push(this.state.idPlayer);
            await updateDoc(playerRef, {
                gameRoom: {
                    id: this.state.idRoom,
                    name: nameRoom
                },
                stateInGame: "Loading"
            });

            await updateDoc(gameRoomRef, {
                listPlayers: listPlayersInRoom
            });
                
        } 
    }


    handleError = err => {
        console.error(err);
    }

    render() {
        return (
            <div>
                <QrReader
                    delay={300}
                    facingMode={"environment"}
                    onError={this.handleError}
                    onScan={this.handleScan}
                    style={{ width: '100%' }}
                />
            </div >
        );
    }
}

export default QRAccessGame;