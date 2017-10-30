import React, {Component} from 'react';
import 'react-mdl/extra/material.js';
import {Spinner} from 'react-mdl';
import firebase from 'firebase';
import 'react-mdl/extra/material.css';
import './App.css';
import Stalls from './Stalls';

// Initialize Firebase
const config = {
    apiKey: "AIzaSyBAIHhafMkp19JTovzUxYuoYNBxo-qPzaQ",
    authDomain: "bon-app-a-ti.firebaseapp.com",
    databaseURL: "https://bon-app-a-ti.firebaseio.com",
    projectId: "bon-app-a-ti",
    storageBucket: "bon-app-a-ti.appspot.com",
    messagingSenderId: "683254335656"
};
firebase.initializeApp(config);
const auth = firebase.auth();
const database = firebase.database();

class LocationUpdater extends Component {
    constructor(props) {
        super(props);
        this.onFix = props.onFix;
        this.lostFix = props.lostFix;
        this.fix = null;
        this.authed = false;
        this.uid = 0;
    }

    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            this.authed = !!user;
            if (user) {
                this.uid = user.uid;
            }
        });
        this.watchId = navigator.geolocation.watchPosition((fix) => {
            if (this.fix === null) {
                this.onFix();
            }
            this.fix = fix;
            if (this.authed) {
                database.ref('locations/' + this.uid).set({
                    coords: {
                        lat: fix.coords.latitude,
                        lng: fix.coords.latitude
                    },
                    timestamp: fix.timestamp
                });
            }
        }, () => {
            if (this.fix !== null) {
                this.lostFix()
            }
            this.fix = null;
        }, {
            enableHighAccuracy: true,
            maximumAge: 0
        });
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchId)
    }

    render() {
        return null;
    }
}

class Loader extends Component {
    render() {
        return (
            <div className="Loader">
                <div className="Loader-inner">
                    <h1>Bon app a ti</h1>
                    <div className="Loader-spinner">
                        <Spinner/>
                    </div>
                </div>
            </div>
        );
    }
}

class App extends Component {
    hasFix = false;
    uid = 0;
    state = {
        loaded: false
    };

    componentDidMount() {
        const self = this;
        auth.onAuthStateChanged(function (user) {
            if (user) {
                self.uid = user.uid;
                self.setState({
                   loaded: true
                });
            } else {
                firebase.auth().signInAnonymously().catch(function (error) {
                    // const errorCode = error.code;
                    // const errorMessage = error.message;
                });
            }
        });
    }

    render() {
        let main = null;
        if (this.state.loaded) {
            main = <Stalls/>;
        } else {
            main = <Loader/>;
        }

        return (
            <div className="App">
                <LocationUpdater onFix={() => {
                    this.hasFix = true
                }} lostFix={() => {
                    this.hasFix = false
                }}/>
                {main}
            </div>
        );
    }
}

export default App;
