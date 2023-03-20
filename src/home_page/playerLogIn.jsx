import React, { Component } from 'react';
import NavBar from '../navBar';
import axios from 'axios';

class PlayerLogIn extends Component {
    constructor(props) {  
        super(props);
        this.state = { 
            idPlayer: null,
            idSubmitted: false
         };
    }  
    

    handleValiderButton = () => {
        const telephone = document.getElementById('telephone').value;
        axios.post('/api/player', {"telephone": telephone}, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((response) => response.data)
        .then((data) => {
            console.log(data);
            if (data.result !== null) {
                this.setState({
                    idPlayer: data.result._id,
                    idSubmitted: true
                });
                window.location.href = `/player-page?id=${data.result._id}`;
            } else {
                document.getElementById("no-player").innerHTML = "No player with this telephone number";
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
                    <button type='button' id='validerButton' onClick={this.handleValiderButton}>Valider</button><br/>
                    <span id="no-player"></span>
                </div>
            </React.Fragment>
        );
    }
}
 
export default PlayerLogIn;