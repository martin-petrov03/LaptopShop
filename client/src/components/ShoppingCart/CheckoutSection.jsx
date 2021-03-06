import React, { useState, useContext } from 'react';
import './index.css';
import Error from '../Error/Error';
import { listContext } from '../../contexts/ShoppingCart';
import checkoutService from '../../services/checkout-service';

function CheckoutSection (props) {
    const { removeAll } = useContext(listContext);
    const [error, setError] = useState('');
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');

    const handleChangeFullName = (event) => {
        event.persist();
        setFullName(event.target.value);        
    }

    const handleChangeAddress = (event) => {
        event.persist();
        setAddress(event.target.value);        
    }

    const checkout = (event) => {
        event.preventDefault();
        setError();
        if(fullName.length < 5) {
            setError('Full name should be at least 5 characters!');
        } else if(address.length < 5) {
            setError('Address should be at least 5 characters!');
        } else {
            let isCorrect = true;         
            props.cart.filter(product => {
                const productName = product.model;
                const quantity = product.count;
                const status = checkoutService.add(fullName, address, productName, quantity);
                if(status === 400 || status === 500) {
                    isCorrect = false;
                }
                return null;
            });
            
            if(isCorrect) {
                removeAll();
            } else {
                return false;
            }
        }
    }

    return (
        <section className="checkout-section">
            {
                error ? <Error message={error} /> : null
            }
            <h2>Checkout</h2>
            <label htmlFor="fullName">Full Name:</label><br/>
            <input type="text" id="fullName" onChange={handleChangeFullName} /><br/>
            <label htmlFor="address">Address: </label><br/>
            <input type="text" id="address" onChange={handleChangeAddress} /><br/>
            <button className="btn" onClick={checkout} >Checkout</button>
        </section>
    )
}

export default CheckoutSection;