import React, {useState, useEffect} from 'react'
import MaterialTable from 'material-table'
import { Alert, Jumbotron } from 'reactstrap'
import { db } from '../firebase'
import { Button, TextField } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import { IconButton } from '@material-ui/core'
import RemoveIcon from '@material-ui/icons/Remove'
import AddIcone from '@material-ui/icons/Add'

export default function UpdateExistingProducts() {
    const [isComplete, setIsComplete] = useState(false)
    const [products, setProducts] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [newProductErrorMessage, setNewProductErrorMessage] = useState('')
    const columns = [
        {title: 'Code', field: 'code'},
        {title: 'Name', field: 'name'},
        {title: 'Description', field: 'description'},
        {title: 'Ventor', field: 'ventor'},
        {title: 'WSP', field: 'wsp', type: 'numeric', editable: 'never'},
        {title: 'Price', field: 'price', type: 'numeric'},
        {title: 'Quantity', field: 'quantity', type: 'numeric', editable: 'never'},
        {title: 'Restock', field: 'restock', type: 'numeric'},
        {title: 'Restock WSP', field: 'restockWSP', type: 'numeric'}
    ]
    const [newProducts, setNewProducts] = useState([
        {code: '', name: '', description: '', ventor: '', wsp: 0, price: 0.0, quantity: 0},
    ])
    const getCurrentInventory = () => {
        setProducts([])
        db.collection('Inventory').where('name', '!=', null)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            const temp = {restock : 0, restockWSP: 0}
            const item = Object.assign(doc.data(), temp)
            setProducts(products =>[...products, item])
            })
        })
        setIsComplete(true)
    }
    useEffect(() => {
        getCurrentInventory()
    }, [])
    const removeProduct = (code) => {
        setIsComplete(false)
        db.collection('Inventory').doc(code).delete().then(() => {
            setIsComplete(true)
        }).catch((error) => {
            console.log(error)
        })
    }
    const pushRestockHistory = (updatedRow) => {
        let date = new Date();
        let currentDate = String(date.getMonth() + 1) + '-' + String(date.getDate()) + '-' + String(date.getFullYear())
        let obj = {
            code: updatedRow.code,
            name: updatedRow.name,
            description: updatedRow.description,
            ventor: updatedRow.ventor,
            price: updatedRow.price,
            restock: updatedRow.restock,
            restockWSP: updatedRow.restockWSP,
            date: currentDate }
        var ref = db.collection('RestockHistory').doc(currentDate).collection(String(Date.now()))
        ref.doc(String(Date.now())).set(obj)
        .then((docRef) => {
            setIsComplete(true)
        }).catch((err) => {
            setErrorMessage('Unable to record the change.')
            console.log(err)
        })
    }
    const updateProduct = (updatedRow, oldRow) => {
        console.log(products)
        setIsComplete(false) 
        var valid = true
        products.forEach((product) => {
            if(product.code === updatedRow.code && updatedRow.code !== oldRow.code){
                setErrorMessage('The code ' + updatedRow.code + ' already exists in the inventory. Please provide a unique code.')
                setProducts([])
                setIsComplete(true)
                valid = false
            }
        })
        if(valid){
            if(Number(updatedRow.restock) < 0 || ((Number(updatedRow.restock) - Math.floor(Number(updatedRow.restock))) !== 0) || Number(updatedRow.price) <= 0 || Number(updatedRow.restockWSP) < 0 || updatedRow.code.trim().length <= 0 || updatedRow.name.trim().length <= 0){
                getCurrentInventory()
                setErrorMessage('Invalid change. Please try again.')
            }
            else{
                if(oldRow.code === updatedRow.code){
                    var obj = {
                        code: updatedRow.code,
                        name: updatedRow.name,
                        description: updatedRow.description,
                        ventor: updatedRow.ventor,
                        price: updatedRow.price,
                        quantity: oldRow.quantity + updatedRow.restock,
                    }
                    if(updatedRow.restock > 0){
                        var newWSP = ((oldRow.quantity * oldRow.wsp) + (updatedRow.restock * updatedRow.restockWSP))/(oldRow.quantity + updatedRow.restock)
                        obj.wsp = newWSP.toFixed(2)
                    }
                    else {
                        obj.wsp = oldRow.wsp
                    }
                    db.collection('Inventory').doc(updatedRow.code).update(obj)
                    .then(() => {
                        if(updatedRow.restock !== 0){
                            pushRestockHistory(updatedRow)
                        }
                        getCurrentInventory()
                        setIsComplete(true)
                        setErrorMessage('')
                    }).catch((error) => {
                        console.log(error)
                    })
                }
                else{
                    removeProduct(oldRow.code)
                    db.collection('Inventory').doc(updatedRow.code).set(updatedRow)
                    .then((docRef) => {
                        setErrorMessage('')
                    }).catch((error) => {
                        setErrorMessage('Unable to update. Please try again.')
                        console.log(error)
                    })
                    return
                }
            }
        }
    }
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
            if(Number(newProduct.price) <= 0 || Number(newProduct.quantity) <= 0 || ((Number(newProduct.quantity) - Math.floor(Number(newProduct.quantity))) !== 0) || newProduct.name.trim().length <= 0 || newProduct.ventor.trim().length <= 0 || Number(newProduct.wsp) <= 0) {
                isValid = false
            }
            return isValid
        })
        return isValid
    }
    const resetNewProducts = () => {
        setNewProducts([
            {code: ' ', name: ' ', description: '', ventor: '', wsp: 0, price: 0.0, quantity: 0},
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
            setNewProductErrorMessage(mess + ' already exist(s) in the inventory. Please use unique code(s).')
        }
        else if(validateInput() && (newProducts.length > 0 && newProducts[0].code.trim().length !== 0)) {
            newProducts.map((newProduct, index) => {
                db.collection('Inventory').doc(newProduct.code).set(newProduct)
                .then((docRef) => {
                    resetNewProducts()
                    setNewProductErrorMessage('')
                }).catch((error) => {
                    setNewProductErrorMessage('Unable to update. Please try again.')
                })
                return mess
            })
        }
        else {
            setNewProductErrorMessage('Please validate required details of new item(s).')
        }
    }
    const handleAddFields = () => {
        setNewProducts([...newProducts, {code: '', name: '', description: '', ventor: '', wsp: 0, price: 0.0, quantity: 0}])
    }
    const handleRemoveFields = (index) => {
        if(newProducts.length > 1){
            var newList = [...newProducts];
            newList.splice(index, 1)
            if(newList.length <= 0){
                newList = [...newList, {code: '', name: '', description: '', ventor: '', wsp: 0, price: 0.0, quantity: 0}]
            }
            setNewProducts(newList);
        }
    }

    if(isComplete)
        return (
            <div style={{position: 'absolute', width: '80vw', paddingTop: '2%', paddingBottom: '2%', paddingRight: '2%'}}>
                <h1 style={{padding: '3%', fontWeight: 'bolder'}}>RESTOCK AND EDIT PRODUCT(S)</h1>
                {errorMessage && <Alert color='danger'>{errorMessage}</Alert>}
                <MaterialTable
                     columns={columns} 
                     data={products} 
                     title=''
                     editable={{
                        onRowDelete:selectedRow => new Promise((resolve, reject) => {
                            const index = selectedRow.tableData.id
                            const updatedInventory = [...products]
                            updatedInventory.splice(index, 1)
                            setTimeout(() => {
                                setProducts(updatedInventory)
                                removeProduct(selectedRow.code)
                                resolve()
                            }, 2000)
                        }),
                        onRowUpdate:(updatedRow, oldRow) => new Promise((resolve, reject) => {
                            const index = oldRow.tableData.id
                            const updatedInventory = [...products]
                            updatedInventory[index] = updatedRow
                            setTimeout(() => {
                                setProducts(updatedInventory)
                                updateProduct(updatedRow, oldRow)
                                resolve()
                            }, 2000)
                        })
                     }}
                     options={{
                         actionsColumnIndex:-1, addRowPosition:'first', pageSize:10, pageSizeOptions:[10,15,20,30]
                     }}
                />
                <br/><br/><hr/>
                <h1 style={{padding: '3%', fontWeight: 'bolder'}}>ADD NEW PRODUCT(S)</h1>
                <Jumbotron>
                    {newProductErrorMessage && <Alert color='danger'>{newProductErrorMessage}</Alert>}
                    <form className={classes.root}>
                        { newProducts.map((newProduct, index) => (
                            <div key={index}>
                                <TextField
                                    variant='standard'
                                    name='code'
                                    label='Code'
                                    value={newProduct.code}
                                    required={true}
                                    style ={{width: '12%'}}
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
                                    name='ventor'
                                    label='Ventor'
                                    value={newProduct.ventor}
                                    multiline={true}
                                    style ={{width: '8%'}}
                                    onChange={event => handleChangeInput(index, event, 'ventor')}
                                />
                                <TextField
                                    variant='standard'                            
                                    name='wsp'
                                    label='WSP'
                                    value={newProduct.wsp}
                                    required={true}
                                    type='number'
                                    style ={{width: '8%'}}
                                    onChange={event => handleChangeInput(index, event, 'wsp')}
                                    error={Number(newProduct.wsp) <= 0}
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
                </Jumbotron>
            </div>
        )
    else {
        return(
            <div></div>
        )
    }
}
