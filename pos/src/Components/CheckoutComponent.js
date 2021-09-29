import React, { useState, useEffect } from 'react'
import BarcodeReader from 'react-barcode-reader'
import MaterialTable from 'material-table'
import { db } from '../firebase'
import { Button } from '@material-ui/core'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import image from '../images/Trio-Lash-Logo-Receipt.png'
import '../styling/BonheurRoyale-Regular-normal'
import '../styling/OpenSansCondensed-Light-normal'
import '../styling/OpenSansCondensed-Bold-normal'
import { Col, Row, Alert } from 'reactstrap'

export default function CheckoutComponent() {
    const [isComplete, setIsComplete] = useState(false)
    const [products, setProducts] = useState([])
    const [checkoutItems, setCheckoutItems] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const columns = [
        {title: 'Code', field: 'code', editable: false},
        {title: 'Name', field: 'name', editable: false},
        {title: 'Description', field: 'description', editable: false},
        {title: 'Price', field: 'price'},
        {title: 'Quantity', field: 'quantity'}
    ]
    const getCurrentInventory = () => {
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
    }
    useEffect(() => {
        getCurrentInventory()
    }, []) 
    const handleBarcode = (data) => {
        setErrorMessage('')
        var seen = false
        var exist = false
        products.forEach((product) => {
            if(product.code === data && product.quantity > 0){
                checkoutItems.forEach((item) => {
                    if(item.code === data){
                        const index = checkoutItems.indexOf(item)
                        const temp = Object.assign({}, item)
                        temp.quantity += 1
                        const newCheckoutItem = [...checkoutItems]
                        newCheckoutItem[index] = temp
                        setCheckoutItems(newCheckoutItem)
                        seen = true
                        products.forEach((product) => {
                            if(product.code === data){
                                product.quantity -= 1
                            }
                        })
                    }
                    exist = true
                })
            }
        })
        if(!seen){
            products.forEach((product) => {
                if(product.code === data && product.quantity > 0){
                    const temp = Object.assign({}, product)
                    temp.quantity = 1
                    setCheckoutItems(checkoutItems =>[...checkoutItems, temp])
                    product.quantity -=  1
                    exist = true
                    return
                }
                else if(product.code === data && product.quantity <= 0){
                    setErrorMessage('Item ' + product.name + ' (' +  product.code + ' ) is out of stock.')
                    setIsComplete(true)
                    exist = true
                    return
                }
            })
        }
        if(!exist){
            setErrorMessage('The item does not exist in the inventory. Please try again.')
            return 
        }
    }
    const handleError = (code) => {
        setErrorMessage('Unable to scan the item. Please try again.')
    }
    const removeProduct = (code) => {
        products.forEach((product) => {
            if(product.code === code){
                product.quantity += 1
            }
        })
    }
    const updateProduct = (code, price, quantity) => {
        if(Number(quantity) <= 0 || ((Number(quantity) - Math.floor(Number(quantity))) !== 0) || Number(price) <= 0){
            setErrorMessage('Invalid change. Please try again.')
        }
        else {
            checkoutItems.forEach((item) => {
                if(item.code === code){
                    item.price = price
                    item.quantity = quantity
                }
            })
        }
    }
    const checkoutHelper = () => {
        setErrorMessage('')
        if(checkoutItems.length > 0){
            checkoutItems.forEach((item) => {
                products.forEach((product) => {
                    if(product.code === item.code){
                        db.collection('Inventory').doc(product.code).update(product).then(() => {
                            setIsComplete(true)
                        }).catch((error) => {
                            console.log(error)
                        })
                    }
                })
            })
            setCheckoutItems([])
        }
        else{
            setErrorMessage('Your cart is empty.')
        }
    }
    const handleClear = () => {
        checkoutItems.forEach((item) => {
            removeProduct(item.code)
        })
        setCheckoutItems([])
        setErrorMessage('')
    }
    const handleCheckoutAndPrint = () => {
        if(checkoutItems.length > 0){
            var total = 0
            var list = []
            var date = new Date()
            var orderNum = Date.now()
            var orderDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
            var tax = 6.0
            checkoutItems.forEach((item) => {
                list.push({quantity: item.quantity, description: item.name, unitPrice: item.price, total: (item.price * item.quantity)})
                total += item.price * item.quantity
            })
            checkoutHelper()
            var orderObj = {orderNum: orderNum, date: orderDate, location: 'South Philly', tax: tax, total: Math.round(((total + ((tax/100) * total) + Number.EPSILON) * 100)) / 100, order: list}
            setIsComplete(false)
            db.collection('Orders').doc(String(orderNum)).set(orderObj)
                .then((docRef) => {
                    setIsComplete(true)
                    setErrorMessage('')
                }).catch((error) => {
                    setErrorMessage('Unable to place the order. Please try again.')
            })
            var doc = new jsPDF('portrait', 'px', 'a5', 'false')
            doc.addImage(image, 'PNG', 15, 15, 120, 47)
            doc.setFont('BonheurRoyale-Regular', 'normal')
            doc.setFontSize(85)
            doc.text(25, 120, 'Thank you')
            doc.setFont('OpenSansCondensed-Light', 'normal')
            doc.setFontSize(20)
            doc.text(180, 140, 'FOR YOUR PURCHASE!')
            doc.setFontSize(11)
            doc.text(20, 160, 'Order #: ' + orderNum)
            doc.text(20, 170, 'Date: ' + orderDate)
            doc.text(20, 180, 'Inventory Location: South Philly')
            doc.line(20,  190, 295, 190)
            doc.autoTable({
                theme: 'plain',
                startY: 195,
                pageBreak: 'auto',
                rowPageBreak: 'avoid',
                columns: [
                    { header: 'Quantity', dataKey: 'quantity' },
                    { header: 'Description', dataKey: 'description' },
                    { header: 'Unit Price', dataKey: 'unitPrice'},
                    { header: 'Total', dataKey: 'total'}
                ],
                body: list,
              })
            doc.setFont('OpenSansCondensed-Bold', 'normal')
            doc.setFontSize(13)
            doc.text(177, doc.autoTable.previous.finalY + 40, 'Subtotal:')
            doc.text(248, doc.autoTable.previous.finalY + 40,  '$' + String(total))
            doc.text(177, doc.autoTable.previous.finalY + 55, 'Sale Tax (' + String(tax) + '%):')
            doc.text(248, doc.autoTable.previous.finalY + 55, '$' + String((Math.round((((tax/100) * total) + Number.EPSILON) * 100)) / 100))
            doc.setFontSize(15)
            doc.text(177, doc.autoTable.previous.finalY + 90, 'Total:')
            doc.text(248, doc.autoTable.previous.finalY + 90, '$' + String(Math.round(((total + ((tax/100) * total) + Number.EPSILON) * 100)) / 100))
            doc.autoPrint()
            doc.output('dataurlnewwindow')
            }
        else{
            setErrorMessage('Your cart is empty.')
        }
    }   
    if(isComplete){
        return (
            <div style={{maxWidth: '90%', paddingTop: '2%', paddingBottom: '2%'}}>
                {errorMessage && <Alert color='danger'>{errorMessage}</Alert>}
                <BarcodeReader minLength={4} onScan={handleBarcode} onError={handleError}></BarcodeReader>
                <MaterialTable
                     columns={columns} 
                     data={checkoutItems} 
                     title='CART'
                     editable={{
                        onRowDelete:selectedRow => new Promise((resolve, reject) => {
                            const index = selectedRow.tableData.id
                            const updatedCheckoutItems = [...checkoutItems]
                            updatedCheckoutItems.splice(index, 1)
                            setTimeout(() => {
                                setCheckoutItems(updatedCheckoutItems)
                                removeProduct(selectedRow.code)
                                resolve()
                            }, 2000)
                        }),
                        onRowUpdate:(updatedRow, oldRow) => new Promise((resolve, reject) => {
                            console.log(updatedRow)
                            const index = oldRow.tableData.id
                            const updatedCheckoutItems = [...checkoutItems]
                            updatedCheckoutItems[index] = updatedRow
                            setTimeout(() => {
                                setCheckoutItems(updatedCheckoutItems)
                                updateProduct(updatedRow.code, updatedRow.price, updatedRow.quantity)
                                resolve()
                            }, 2000)
                        })
                     }}
                     options={{
                         actionsColumnIndex:-1, addRowPosition:'first', pageSize:10, pageSizeOptions:[10, 15, 20, 30], search: false
                     }}
                     />
                     <Row className='buttonGroup'>
                         <Col><Button variant='outlined' onClick={handleCheckoutAndPrint}>CHECK OUT AND PRINT</Button></Col>
                         <Col><Button variant='outlined' onClick={handleClear}>CLEAR</Button></Col>
                     </Row>
            </div>
        )
    }
    else {
        return(
            <div></div>
        )
    }
}
