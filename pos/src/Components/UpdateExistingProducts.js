import React, {useState, useEffect} from 'react'
import MaterialTable from 'material-table'
import { Alert } from 'reactstrap'
import { db } from '../firebase'

export default function UpdateExistingProducts() {
    const [isComplete, setIsComplete] = useState(false)
    const [products, setProducts] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const columns = [
        {title: 'Code', field: 'code'},
        {title: 'Name', field: 'name'},
        {title: 'Description', field: 'description'},
        {title: 'Price', field: 'price', type: 'numeric'},
        {title: 'Quantity', field: 'quantity', type: 'numeric'}
    ]
    const getCurrentInventory = () => {
        setProducts([])
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
    const removeProduct = (code) => {
        setIsComplete(false)
        db.collection('Inventory').doc(code).delete().then(() => {
            setIsComplete(true)
        }).catch((error) => {
            console.log(error)
        })
    }
    const updateProduct = (updatedRow, oldRow) => {
        setIsComplete(false) 
        var valid = true
        products.forEach((product) => {
            if(product.code === updatedRow.code && updatedRow.code !== oldRow.code){
                setErrorMessage('The code ' + updatedRow.code + ' already exists in the inventory. Please provide a unique code.')
                setProducts([])
                getCurrentInventory()
                valid = false
            }
        })
        if(valid){
            if(Number(updatedRow.quantity) <= 0 || ((Number(updatedRow.quantity) - Math.floor(Number(updatedRow.quantity))) !== 0) || Number(updatedRow.price) <= 0 || updatedRow.code.trim().length <= 0 || updatedRow.name.trim().length <= 0){
                getCurrentInventory()
                setErrorMessage('Invalid change. Please try again.')
            }
            else{
                if(oldRow.code === updatedRow.code){
                    db.collection('Inventory').doc(updatedRow.code).update({
                        code: updatedRow.code,
                        name: updatedRow.name,
                        description: updatedRow.description,
                        price: updatedRow.price,
                        quantity: updatedRow.quantity
                    }).then(() => {
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

    if(isComplete)
        return (
            <div style={{maxWidth: '90%', paddingTop: '2%', paddingBottom: '2%'}}>
                {errorMessage && <Alert color='danger'>{errorMessage}</Alert>}
                <MaterialTable
                     columns={columns} 
                     data={products} 
                     title='INVENTORY'
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
            </div>
        )
    else {
        return(
            <div></div>
        )
    }
}
