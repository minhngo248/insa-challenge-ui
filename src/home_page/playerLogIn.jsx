import React, { Component } from 'react';
import NavBar from '../navBar';
import axios from 'axios';

class PlayerLogIn extends Component {
    state = {  } 

    handleValiderButton = () => {
        const telephone = document.getElementById('telephone').value;
        axios.post('/api/player', {"telephone": telephone}, {
            headers: {
                "Content-type": "application/json"
            }
        })
        .then((response) => response.data)
        .then((data) => {
            if (data.result === null) {
                document.getElementById("noPlayer").innerHTML = "No player";
            } else {
                window.location = `/player-page?id=${data.result._id}`;
            }
        })
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
                        <label>Telephone</label><br/>
                        <input type={'text'} placeholder='00 00 00 00 00' id="telephone"/>
                    </form>
                    <button type='button' id='validerButton' onClick={this.handleValiderButton}>Valider</button>
                    <div id="noPlayer"></div>
                </div>
            </React.Fragment>
        );
    }
}
 
export default PlayerLogIn;