import axios from 'axios';
import React, { Component } from 'react';

class AdminHomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAuthenticated: false
        };
        this._mounted = false;
    }

    componentDidMount() {
        if (this._mounted) return;
        axios.get('/api/admin')
        .then(response => response.data)
        .then(data => {
            if (data.adminOnline) 
                this.setState({
                    isAuthenticated: true
                });
        })
        .catch(err => {
            console.log("error while parsing admin page " + err);
        })
        this._mounted = true;
    }

    render() {
        if (!this.state.isAuthenticated) return (<h2>Admin not found</h2>);
        return (
            <React.Fragment>
                <div id="main">
                    <h2>Hello admin</h2>
                </div>
            </React.Fragment>
        );
    }
}

export default AdminHomePage;