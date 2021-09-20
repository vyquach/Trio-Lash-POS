import React, {useState, useEffect} from 'react'
import MaterialTable from 'material-table'
import { db } from '../firebase'

export default function UpdateExistingProducts() {
    const [isComplete, setIsComplete] = useState(false)
    const [products, setProducts] = useState([])
    const columns = [
        {title: 'Code', field: 'code'},
        {title: 'Name', field: 'name'},
        {title: 'Description', field: 'description'},
        {title: 'Price', field: 'price'},
        {title: 'Quantity', field: 'quantity'}
    ]
    useEffect(() => {
        setProducts([])
        setIsComplete(false)
        db.collection('Inventory').where('name', '!=', null)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            setProducts(products =>[...products, doc.data()])
            })
        })
        setIsComplete(true)
    }, [])
    const removeProduct = (code) => {
        setIsComplete(false)
        db.collection('Inventory').doc(code).delete().then(() => {
            setIsComplete(true)
        }).catch((error) => {

        })
    }
    const updateProduct = (updatedRow) => {
        setIsComplete(false)
        db.collection('Inventory').doc(updatedRow.code).update({
            code: updatedRow.code,
            name: updatedRow.name,
            description: updatedRow.description,
            price: updatedRow.price,
            quantity: updatedRow.quantity
        }).then(() => {
            setIsComplete(true)
        }).catch((error) => {
            
        })
    }

    if(isComplete)
        return (
            <div style={{maxWidth: '80%'}}>
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
                                updateProduct(updatedRow)
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
