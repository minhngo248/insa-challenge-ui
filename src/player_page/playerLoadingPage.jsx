import React, { Component } from 'react';
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import db from '../firebase';

class PlayerLoadingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: "",
            name: "",
            score: 0,
            isAuthenticated: false,
            stateInGame: "",
            actualGame: ""
        };
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        const idPlayer = params.get("idAd");
        const playerRef = doc(db, "players", idPlayer);
        onSnapshot(playerRef, async (doc) => {
            this.setState({
                _id: idPlayer,
                name: doc.data().name,
                score: doc.data().score,
                isAuthenticated: doc.data().online,
                stateInGame: doc.data().stateInGame,
                actualGame: doc.data().gameRoom
            });
            if (doc.stateInGame === "") {
                window.location = `/player-page?id=${idPlayer}`;
            } else if (doc.stateInGame === "Playing") {
                window.location = `/player-ingame-page?id=${idPlayer}`;
            } else if (doc.stateInGame === "Playing wolf") {
                window.location = `/player-wolf-page?id=${idPlayer}&idGr=KCx0sRAZpccfwWhjK0ih`;
            }
        });
    }

    render() {
        if (!this.state.isAuthenticated) return (<h1>Loading ...</h1>);
        return (
            <>
                <div id="main">
                    <h1>Hello {this.state.name}</h1>
                    <h1>Game room: {this.state.actualGame.name}</h1>
                    <h2 className="Loading">
                        Waiting for all players to join...
                    </h2>
                </div>
            </>
        )
    }
}

export default PlayerLoadingPage;