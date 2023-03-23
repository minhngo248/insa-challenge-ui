import React, { Component } from 'react';
import NavBar from '../navBar';
import { collection, getDocs, query, where, updateDoc, doc, getDoc } from "firebase/firestore";
import db from '../firebase';

class AdminLogIn extends Component {
    state = {
    }

    handleValiderButton = async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const q = query(collection(db, "admins"), where("username", "==", username), where("password", "==", password));
        
        const querySnapshot = await getDocs(q);
        var isSignedIn = false;
        querySnapshot.forEach(async (doc_query) => {
            const adminRef = doc(db, "admins", doc_query.id);
            // Set the "capital" field of the city 'DC'
            await updateDoc(adminRef, {
                online: true
            });
            if (username === 'admin') {
                window.location.href = `/big-admin-page?id=${doc_query.id}`;
            } else {
                const adminSnap = await getDoc(adminRef);
                window.location.href = `/admin-game-page?idAd=${doc_query.id}&idGr=${adminSnap.data().gameRoom.id}`;
            }
            isSignedIn = true;
        });
        if (!isSignedIn) {
            document.getElementById('failedSignIn').innerHTML = 'Aucun admin ne correspond à ce nom d\'utilisateur et ce mot de passe';
        }
    }

    render() {
        return (
            <React.Fragment>
                <div id="header">
                    <NavBar />
                </div>

                <div id="main">
                    <h2>Admin</h2>
                    <form>
                        <label>Username</label><br />
                        <input type={'text'} name="username" id="username"/><br />
                        <label>Password</label><br />
                        <input type={'password'} name="password" id="password"/>
                    </form>
                    <button type='button' id='validerButton' onClick={this.handleValiderButton}>Valider</button>
                    <div id="failedSignIn"></div>
                </div>
            </React.Fragment>
        );
    }
}

export default AdminLogIn;