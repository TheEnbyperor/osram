import React, {Component} from 'react';
import {Card, CardTitle, CardActions, Button} from 'react-mdl';
import {database} from './App';
import Order from './Order';
import './Stalls.css';

class Stall extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '...',
            headerImg: ''
        };
    }

    componentDidMount() {
        const self = this;
        database.ref('stalls/' + this.props.id).on('value', (data) => {
            self.setState({
                name: data.val().name,
                headerImg: data.val().headerImg
            });
        });
    }

    render() {
        return (
            <div className="Stall">
                <Card shadow={0} style={{width: '100%'}}>
                    <CardTitle style={{
                        color: '#fff',
                        height: '176px',
                        background: 'url(' + this.state.headerImg + ') center / cover'
                    }}>
                        {this.state.name}
                    </CardTitle>
                    <CardActions border>
                        <Button onClick={() => this.props.onClick(this.props.id)} colored ripple>Order</Button>
                    </CardActions>
                </Card>
            </div>
        )
    }
}

export default class Stalls extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stalls: [],
            ordering: null
        };
    }

    componentDidMount() {
        const self = this;
        database.ref('stalls').on('value', (data) => {
            let stalls = [];
            Object.keys(data.val()).forEach((key, index) => {
                stalls.push(key);
            });
            self.setState({
                stalls: stalls
            })
        })
    }

    openStall(id) {
        this.setState({
            ordering: id
        })
    }

    render() {
        let display = null;
        if (this.state.ordering) {
            display = <Order id={this.state.ordering} showMessage={this.props.showMessage}/>;
        } else {
            let stalls = [<h2 key="a">Stalls</h2>];
            for (let stall in this.state.stalls) {
                let id = this.state.stalls[stall];
                stalls.push(<Stall key={stall} id={id} onClick={this.openStall.bind(this)}/>)
            }
            display = stalls;
        }
        return (
            <div className="Stalls">
                {display}
            </div>
        )
    }
}