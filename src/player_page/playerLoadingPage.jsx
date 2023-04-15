import React, { Component } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
import db from '../firebase';

class PlayerLoadingPage extends Component {
    constructor(props) {
        super(props);
        const params = new URLSearchParams(this.props.location.search);
        const idPlayer = params.get("idAd");
        this.state = {
            _id: idPlayer,
            name: "",
            score: 0,
            isAuthenticated: false,
            stateInGame: "",
            actualGame: ""
        };
    }

    componentDidMount() {
        const playerRef = doc(db, "players", this.state._id);
        onSnapshot(playerRef, (doc) => {
            if (doc.data().stateInGame === "") {
                window.location = `/player-page?id=${this.state._id}`;
            } else if (doc.data().stateInGame === "Playing") {
                window.location = `/player-ingame-page?id=${this.state._id}`;
            } else if (doc.data().stateInGame === "Playing wolf") {
                window.location = `/player-wolf-page?id=${this.state._id}&idGr=KCx0sRAZpccfwWhjK0ih`;
            }

            this.setState({
                name: doc.data().name,
                score: doc.data().score,
                isAuthenticated: doc.data().online,
                stateInGame: doc.data().stateInGame,
                actualGame: doc.data().gameRoom
            });

            
        });
    }

    render() {
        if (!this.state.isAuthenticated) return (<h1>Loading ...</h1>);
        return (
            <>
                <div id="main">
                    <h1>Hello {this.state.name}</h1>
                    <h1>Game room: {this.state.actualGame["name"]}</h1>
                    <h2 className="Loading">
                        Waiting for all players to join...
                    </h2>
                </div>
            </>
        )
    }
}

export default PlayerLoadingPage;