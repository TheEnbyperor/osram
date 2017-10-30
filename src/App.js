import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

class LocationUpdater extends Component {
    constructor(props) {
        super(props);
        this.onFix = props.onFix;
        this.lostFix =props.lostFix;
        this.fix = null;
    }

    componentDidMount() {
        this.watchId = navigator.geolocation.watchPosition((fix) => {
            if (this.fix === null) {
                this.onFix();
            }
            this.fix = fix;
            console.log(fix);
        }, () => {
            if (this.fix !== null) {
                this.lostFix()
            }
            this.fix = null;
        }, {
            enableHighAccuracy: true,
            maximumAge: 0
        })
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchId)
    }

    render() {
        return null;
    }
}

class App extends Component {
    hasFix = false;

    render() {
        return (
            <div className="App">
                <LocationUpdater onFix={() => {this.hasFix=true}} lostFix={() => {this.hasFix=false}} />
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>
            </div>
        );
    }
}

export default App;
