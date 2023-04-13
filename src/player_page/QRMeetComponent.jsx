import React, { Component } from 'react';
import QrReader from 'modern-react-qr-reader';
import { doc, updateDoc, getDoc } from "firebase/firestore";
import db from '../firebase';

class QRMeetComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idPlayer: this.props.idPlayer,
            result: 'No result',
            limScore: this.props.limScore
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
                meetHistory: meetHistory,
                "scoreInGame.wolf": calculateScore(playerSnap.data().scoreInGame.wolf, playerMeetSnap.data().scoreInGame.wolf, this.state.limScore)
            });
            var meetHistory2 = playerMeetSnap.data().meetHistory;
            meetHistory2.push({
                _id: this.state.idPlayer,
                name: playerSnap.data().name,
                time: time
            });
            await updateDoc(playerMeetRef, {
                meetHistory: meetHistory2,
                "scoreInGame.wolf": calculateScore(playerMeetSnap.data().scoreInGame.wolf, playerSnap.data().scoreInGame.wolf, this.state.limScore)
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
            </div>
        );
    }
}

function calculateScore(score1, score2, lim) {
    var score = score1;

    switch (lim) {
        case -1:
            if (score2 <= -1) {
                score -= 2;
            } else if (score2 >= 1) {
                score += 1;
            } else {
                if (score1 >= 0) {
                    score += 1;
                }
            }

            if (score <= lim) score = lim;

            break;
            //return score;
        case -3:
            if (score2 <= -1) {
                if (score1 >= 1) {
                    score -= 2;
                } else {
                    score -= 1;
                }
            } else if (score2 >= 1) {
                score += 1;
            } else {
                if (score1 >= 0) {
                    score += 1;
                }
            }

            if (score <= lim) score = lim;

            break;
    }
    return score;
}

export default QRMeetComponent;