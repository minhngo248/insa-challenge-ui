import React, { Component } from 'react';
import QrReader from 'modern-react-qr-reader';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import db from '../firebase';

class QRMeetComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idPlayer: this.props.idPlayer,
            result: 'No result'
        };
    }

    handleScan = async data => {
        if (data !== null && data !== '') {
            const playerRef = doc(db, "players", this.state.idPlayer);
            const playerSnap = await getDoc(playerRef);
            var meetHistory = playerSnap.data().meetHistory;
            var person = meetHistory.find(person => person["_id"] === data);
            if (person !== undefined) {
                return;
            }
            var date = new Date();
            var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            const playerMeetRef = doc(db, "players", data);
            const playerMeetSnap = await getDoc(playerMeetRef);
            meetHistory.push({
                _id: data,
                name: playerMeetSnap.data().name,
                time: time
            });
            await updateDoc(playerRef, {
                meetHistory: meetHistory
            });
            var meetHistory2 = playerMeetSnap.data().meetHistory;
            meetHistory2.push({
                _id: this.state.idPlayer,
                name: playerSnap.data().name,
                time: time
            });
            await updateDoc(playerMeetRef, {
                meetHistory: meetHistory2
            });
            this.setState({ result: data });
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
                <p>{this.state.result}</p>
            </div>
        );
    }
}

export default QRMeetComponent;