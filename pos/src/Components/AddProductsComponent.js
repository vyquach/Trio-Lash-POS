import React, { useState, useEffect } from 'react'
import Container from '@material-ui/core/Container'
import { Button, TextField } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import { IconButton } from '@material-ui/core'
import RemoveIcon from '@material-ui/icons/Remove'
import AddIcone from '@material-ui/icons/Add'
import { db } from '../firebase'

export default function AddProductsComponent() {
    const [isComplete, setIsComplete] = useState(false)
    const [products, setProducts] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [isSuccessful, setIsSuccessful] = useState(false)
    const getCurrentInventory = () => {
        db.collection('Inventory').where('name', '!=', null)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            setProducts(products =>[...products, doc.data()])
            })
        })
        setIsComplete(true)
    }
    useEffect(() => {
        getCurrentInventory()
    }, [])
    const [newProducts, setNewProducts] = useState([
        {code: ' ', name: ' ', description: '', price: 0.0, quantity: 0},
    ])
    const useStyles = makeStyles((theme) =>({
        root: {
            '& .MuiTextField-root': {
                margin: theme.spacing(1),
                color: 'white'
            }
        }
    }))
    const classes = useStyles()
    const handleChangeInput = (index, event) => {
        const values = [...newProducts];
        values[index][event.target.name] =  event.target.value
        setNewProducts(values)
    }
    const validateInput = () => {
        var isValid = true
        newProducts.map((newProduct) =>{
            newProduct.code = newProduct.code.trim()
            if(Number(newProduct.price) <= 0 || Number(newProduct.quantity) <= 0) {
                isValid = false
            }
        })
        return isValid
    }
    const resetNewProducts = () => {
        setNewProducts([
            {code: ' ', name: ' ', description: '', price: 0.0, quantity: 0},
        ])
    }
    const handleSubmit = (e) => {
        setIsSuccessful(false)
        e.preventDefault()
        var mess = ''
        newProducts.map((newProduct, index) => {
            products.map((product, i) => {
                if(newProduct.code.trim() === product.code){
                    mess += ' ' + newProduct.code
                }
            })
        })
        if(mess.trim().length > 0){
            setErrorMessage(mess + ' already exist(s) in the inventory. Please use unique code(s).')
        }
        else if(validateInput() && (newProducts.length > 0 && newProducts[0].code.trim().length !== 0)) {
            newProducts.map((newProduct, index) => {
                db.collection('Inventory').doc(newProduct.code).set(newProduct)
                .then((docRef) => {
                    getCurrentInventory()
                    resetNewProducts()
                    setErrorMessage('')
                    setIsSuccessful(true)
                }) .catch((error) => {
                    setErrorMessage('Unable to update. Please try again.')
                })
            })
        }
        else {
            setErrorMessage('Please validate required details of new item(s).')
        }
    }
    const handleAddFields = () => {
        setNewProducts([...newProducts, {code: ' ', name: ' ', description: '', price: 0.0, quantity: 0}])
    }
    const handleRemoveFields = (index) => {
        if(newProducts.length > 1){
            const newList = [...newProducts];
            newList.splice(index, 1)
            setNewProducts(newList);
        }
    }
    if(isComplete){
        return (
            <Container>
                {isSuccessful ? <p className='successfulMessage'>Successfully updated the inventory.</p> : <p className='errorMessage'>{errorMessage}</p>}
                <form className={classes.root}>
                    { newProducts.map((newProduct, index) => (
                        <div key={index}>
                                <TextField
                                name='code'
                                label='Code'
                                variant='filled'
                                value={newProduct.code}
                                required={true}
                                style ={{width: '8%'}}
                                onChange={event => handleChangeInput(index, event)}
                                error={(typeof newProduct.code) !== 'string' || newProduct.code.length <= 0}
                            />
                            <TextField
                                name='name'
                                label='Name'
                                variant='filled'
                                value={newProduct.name}
                                required={true}
                                style ={{width: '15%'}}
                                onChange={event => handleChangeInput(index, event)}
                                error={(typeof newProduct.name) !== 'string' || newProduct.name.length <= 0}
                            />
                            <TextField
                                name='description'
                                label='Description'
                                variant='filled'
                                value={newProduct.description}
                                multiline={true}
                                style ={{width: '25%'}}
                                onChange={event => handleChangeInput(index, event)}
                            />
                            <TextField
                                name='price'
                                label='Price'
                                variant='filled'
                                type='number'
                                value={newProduct.price}
                                required={true}
                                style = {{width: '8%'}}
                                onChange={event => handleChangeInput(index, event)}
                                error={Number(newProduct.price) <= 0}
                            />
                            <TextField
                                name='quantity'
                                label='Quantity'
                                variant='filled'
                                type='number'
                                value={newProduct.quantity}
                                required={true}
                                style = {{width: '8%'}}
                                onChange={event => handleChangeInput(index, event)}
                                error={Number(newProduct.quantity) <= 0}
                            />
                            <IconButton onClick={() => handleRemoveFields(index)}>
                                <RemoveIcon></RemoveIcon>
                            </IconButton>
                            <IconButton onClick={() => handleAddFields()}>
                                <AddIcone></AddIcone>
                            </IconButton>
                        </div>
                    ))}
                </form>
                <Button variant='contained' color='primary' type='submit' onClick={handleSubmit}>UPDATE</Button>
            </Container>
        )
    }
    else {
        return(
            <div></div>
        )
    }
}
