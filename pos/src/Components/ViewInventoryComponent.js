import React, {useState, useEffect} from 'react'
import MaterialTable from 'material-table'
import { db } from '../firebase'

export default function ViewInventoryComponent() {
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
        db.collection('Inventory').where('name', '!=', null)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            setProducts(products =>[...products, doc.data()])
            })
        })
        setIsComplete(true)
    }, [])

    if(isComplete)
        return (
            <div style={{maxWidth: '80%'}}>
                <MaterialTable columns={columns} data={products} title='INVENTORY'/>
            </div>
        )
    else {
        return(
            <div></div>
        )
    }
}
