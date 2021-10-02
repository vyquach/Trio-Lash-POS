import React, { useState, useEffect } from 'react'
import Container from '@material-ui/core/Container'
import { Button, TextField } from '@material-ui/core'
import { Alert } from 'reactstrap'
import { makeStyles } from '@material-ui/core'
import { IconButton } from '@material-ui/core'
import RemoveIcon from '@material-ui/icons/Remove'
import AddIcone from '@material-ui/icons/Add'
import { db } from '../firebase'

export default function AddProductsComponent() {
    const [isComplete, setIsComplete] = useState(false)
    const [products, setProducts] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
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
        {code: '', name: '', description: '', price: 0.0, quantity: 0},
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
    const handleChangeInput = (index, event, type) => {
        const values = [...newProducts];
        if(type === 'quantity' || type === 'price'){
            values[index][event.target.name] =  Number(event.target.value)
        }
        else{
            values[index][event.target.name] =  event.target.value
        }
        setNewProducts(values)
    }
    const validateInput = () => {
        var isValid = true
        newProducts.forEach((newProduct) =>{
            newProduct.code = newProduct.code.trim()
            if(Number(newProduct.price) <= 0 || Number(newProduct.quantity) <= 0 || ((Number(newProduct.quantity) - Math.floor(Number(newProduct.quantity))) !== 0) || newProduct.name.trim().length <= 0) {
                isValid = false
            }
            return isValid
        })
        return isValid
    }
    const resetNewProducts = () => {
        setNewProducts([
            {code: ' ', name: ' ', description: '', price: 0.0, quantity: 0},
        ])
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        getCurrentInventory()
        var mess = ''
        newProducts.map((newProduct, index) => {
            products.map((product, i) => {
                if(newProduct.code.trim() === product.code){
                    mess += ' ' + newProduct.code
                }
                return mess
            })
            return mess
        })
        if(mess.trim().length > 0){
            setErrorMessage(mess + ' already exist(s) in the inventory. Please use unique code(s).')
        }
        else if(validateInput() && (newProducts.length > 0 && newProducts[0].code.trim().length !== 0)) {
            newProducts.map((newProduct, index) => {
                db.collection('Inventory').doc(newProduct.code).set(newProduct)
                .then((docRef) => {
                    resetNewProducts()
                    setErrorMessage('')
                }).catch((error) => {
                    setErrorMessage('Unable to update. Please try again.')
                })
                return mess
            })
        }
        else {
            setErrorMessage('Please validate required details of new item(s).')
        }
    }
    const handleAddFields = () => {
        setNewProducts([...newProducts, {code: '', name: '', description: '', price: 0.0, quantity: 0}])
    }
    const handleRemoveFields = (index) => {
        if(newProducts.length > 1){
            var newList = [...newProducts];
            newList.splice(index, 1)
            if(newList.length <= 0){
                newList = [...newList, {code: '', name: '', description: '', price: 0.0, quantity: 0}]
            }
            setNewProducts(newList);
        }
    }
    if(isComplete){
        return (
            <Container style={{paddingTop: '2%', paddingBottom: '2%'}}>
                {errorMessage && <Alert color='danger'>{errorMessage}</Alert>}
                <form className={classes.root}>
                    { newProducts.map((newProduct, index) => (
                        <div key={index}>
                                <TextField
                                variant='standard'
                                name='code'
                                label='Code'
                                value={newProduct.code}
                                required={true}
                                style ={{width: '8%'}}
                                onChange={event => handleChangeInput(index, event, 'code')}
                                error={(typeof newProduct.code) !== 'string' || newProduct.code.trim().length <= 0}
                            />
                            <TextField
                                variant='standard'
                                name='name'
                                label='Name'
                                value={newProduct.name}
                                required={true}
                                style ={{width: '15%'}}
                                onChange={event => handleChangeInput(index, event, 'name')}
                                error={(typeof newProduct.name) !== 'string' || newProduct.name.trim().length <= 0}
                            />
                            <TextField
                                variant='standard'                            
                                name='description'
                                label='Description'
                                value={newProduct.description}
                                multiline={true}
                                style ={{width: '25%'}}
                                onChange={event => handleChangeInput(index, event, 'description')}
                            />
                            <TextField
                                variant='standard'
                                name='price'
                                label='Price'
                                type='number'
                                value={newProduct.price}
                                required={true}
                                style = {{width: '8%'}}
                                onChange={event => handleChangeInput(index, event, 'price')}
                                error={Number(newProduct.price) <= 0}
                            />
                            <TextField
                                variant='standard'
                                name='quantity'
                                label='Quantity'
                                type='number'
                                value={newProduct.quantity}
                                required={true}
                                style = {{width: '8%'}}
                                onChange={event => handleChangeInput(index, event, 'quantity')}
                                error={Number(newProduct.quantity) <= 0 || ((Number(newProduct.quantity) - Math.floor(Number(newProduct.quantity))) !== 0)}
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
                <br/><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleSubmit}>ADD</Button>
            </Container>
        )
    }
    else {
        return(
            <div></div>
        )
    }
}
