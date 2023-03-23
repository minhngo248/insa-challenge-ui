import React, { Component } from 'react';
import NavBar from '../navBar';
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import db from '../firebase';

class PlayerLogIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    handleValiderButton = async () => {
        var telephone = document.getElementById('telephone').value;
        telephone = telephone.replace(/ /g, '');
        const q = query(collection(db, "players"), where("tel_number", "==", telephone));
        
        const querySnapshot = await getDocs(q);
        var isSignedIn = false;
        querySnapshot.forEach(async (doc_query) => {
            const playerRef = doc(db, "players", doc_query.id);
            // Set the "capital" field of the city 'DC'
            await updateDoc(playerRef, {
                online: true
            });
            window.location.href = `/player-page?id=${doc_query.id}`;
            isSignedIn = true;
        });
        if (!isSignedIn) {
            document.getElementById('no-player').innerHTML = 'Aucun joueur ne correspond à ce numéro de téléphone';
        }
    }


    render() {
        return (
            <React.Fragment>
                <div id="header">
                    <NavBar />
                </div>

                <div id="main">
                    <h2>Player</h2>
                    <form>
                        <label>Telephone</label><br />
                        <input type={'text'} placeholder='00 00 00 00 00' id="telephone" />
                    </form>
                    <button type='button' id='validerButton' onClick={this.handleValiderButton}>Valider</button><br />
                    <span id="no-player"></span>
                </div>
            </React.Fragment>
        );
    }
}

export default PlayerLogIn;