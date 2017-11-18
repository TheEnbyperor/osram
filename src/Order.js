import React, {Component} from 'react';
import {Card, CardTitle, CardText, DataTable, TableHeader, Button, IconButton} from 'react-mdl';
import {database, auth} from "./App";
import './Order.css';

export default class Order extends Component {
    constructor(props) {
        super(props);
        this.uid = 0;
        this.state = {
            name: '...',
            headerImg: '',
            items: [],
            cart: {}
        };
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.uid = user.uid;
            }
        });
    }

    componentDidMount() {
        const self = this;
        database.ref('menu/' + this.props.id).on('value', (data) => {
            let items = [];
            Object.keys(data.val()).forEach((val, index) => {
                let item = data.val()[val];
                items.push({item: item.name, price: item.price, id: val});
            });
            self.setState({
                items: items
            })
        });
        database.ref('stalls/' + this.props.id).on('value', (data) => {
            self.setState({
                name: data.val().name,
                headerImg: data.val().headerImg
            });
        });
    }

    addItem(id) {
        let cart = this.state.cart;
        if (this.state.cart[id]) {
            cart[id] += 1
        } else {
            cart[id] = 1
        }
        this.setState({
            cart: cart
        });
    }

    removeItem(id) {
        let cart = this.state.cart;
        cart[id] -= 1;
        if (cart[id] < 1) {
            delete cart[id];
        }
        this.setState({
            cart: cart
        });
    }

    getItem(id) {
        let item = null;
        this.state.items.forEach((val, index) => {
            if (val.id === id) {
                item = val;
            }
        });
        return item;
    }

    calculateCart() {
        let items = [];
        Object.keys(this.state.cart).forEach((val, index) => {
            let quantity = this.state.cart[val];
            let item = this.getItem(val);
            items.push({item: item.item, quantity: quantity, price: item.price*quantity, id: val});
        });
        return items;
    }

    placeOrder() {
        if (Object.keys(this.state.cart).length < 1) {
            this.props.showMessage("There must be at least one item in your cart to place an order")
        } else {
            database.ref('pendingOrders').push({
               uid: this.uid,
               cart: this.state.cart
            }, () => {
                this.props.showMessage("Order placed, awaiting conformation");
                this.setState({
                    cart: {}
                });
            });
        }
    }

    render() {
        return (
            <div className="Order">
                <h2><IconButton name="backspace" style={{fontSize: '24px'}}
                                onClick={this.props.onBack}/> {this.state.name}</h2>
                <Card shadow={0} style={{width: '100%'}}>
                    <CardTitle style={{
                        color: '#fff',
                        height: '176px',
                        background: 'url(' + this.state.headerImg + ') center / cover'
                    }}>
                        Menu
                    </CardTitle>
                    <CardText>
                        <DataTable
                            rows={this.state.items}
                            style={{width: '100%'}}
                        >
                            <TableHeader name="item">Item</TableHeader>
                            <TableHeader numeric name="price" cellFormatter={(price) => `${(price / 100).toFixed(2)}`}>
                                Price</TableHeader>
                            <TableHeader name="id" cellFormatter={(id) =>
                                <Button raised colored ripple onClick={this.addItem.bind(this, id)}>Order</Button>}>
                                Order</TableHeader>
                        </DataTable>
                    </CardText>
                </Card>
                <Card shadow={0} style={{width: '100%'}}>
                    <CardText>
                        <h4>Cart</h4>
                        <DataTable
                            shadow={0}
                            rows={this.calculateCart()}
                            style={{width: '100%'}}
                        >
                            <TableHeader name="item">Item</TableHeader>
                            <TableHeader numeric name="quantity">Quantity</TableHeader>
                            <TableHeader numeric name="price" cellFormatter={(price) => `${(price / 100).toFixed(2)}`}>
                                Price</TableHeader>
                            <TableHeader name="id" cellFormatter={(id) =>
                                <IconButton name="remove" colored ripple onClick={this.removeItem.bind(this, id)}>-</IconButton>}>
                                Remove</TableHeader>
                        </DataTable>
                        <Button raised colored ripple onClick={this.placeOrder.bind(this)}>Place Order</Button>
                    </CardText>
                </Card>
            </div>
        )
    }
};