import React, { useState, useEffect } from 'react'
import BarcodeReader from 'react-barcode-reader'
import MaterialTable from 'material-table'
import { db } from '../firebase'
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, InputAdornment, MenuItem, TextField } from '@material-ui/core'
//import jsPDF from 'jspdf'
import 'jspdf-autotable'
//import image from '../images/Trio-Lash-Logo-Receipt.png'
import '../styling/BonheurRoyale-Regular-normal'
import '../styling/OpenSansCondensed-Light-normal'
import '../styling/OpenSansCondensed-Bold-normal'
import { Col, Row, Alert } from 'reactstrap'
import { makeStyles } from '@material-ui/core'
import {useAuth} from '../Context/AuthContext'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

export default function CheckoutComponent() {
    const [isComplete, setIsComplete] = useState(false)
    const [products, setProducts] = useState([])
    const [checkoutItems, setCheckoutItems] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [shippingMethod, setShippingMethod] = useState('')
    const [customShippingMethod, setCustomShippingMethod] = useState(false)
    const [shippingMethodList, setShippingMethodList] = useState([])
    const [subtotal, setSubtotal] = useState(0)
    const [total, setTotal] = useState(0)
    const [taxApplied, setTaxApplied] = useState(true)
    const [taxRate, setTaxRate] = useState(0)
    const [taxAmount, setTaxAmount] = useState(0)
    const [coupon, setCoupon] = useState(false)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [shippingCost, setShippingCost] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState('')
    const [paymentMethodList, setPaymentMethodList] = useState([])
    const [splitPayment, setSplitPayment] = useState(false)
    const [splitPaymentMethod, setSplitPaymentMethod] = useState()
    const { userInfo } = useAuth()
    const columns = [
        {title: 'Code', field: 'code', editable: false},
        {title: 'Name', field: 'name', editable: false},
        {title: 'Description', field: 'description', editable: false},
        {title: 'Price', field: 'price', editable: false},
        {title: 'Quantity', field: 'quantity'},
    ]
    const getCurrentInventory = () => {
        setIsComplete(false)
        setProducts([])
        db.collection(userInfo.location).doc('Inventory').collection('Inventory')
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            const temp = {restock : 0, restockWSP: 0}
            const item = Object.assign(doc.data(), temp)
            setProducts(products =>[...products, item])
            setErrorMessage('')
            })
        })
        .catch((err) => {
            setErrorMessage('Unable to get the details of the inventory.')
            console.log(err)
        })
        setIsComplete(true)
    }
    async function initConfig(){
        try{
            db.collection('Configuration').doc('Configuration')
            .get()
            .then((querySnapShot) => {
                var shippingList = querySnapShot.data().shippingMethod
                var newShippingList = []
                shippingList.forEach((item) => {
                    var temp = {}
                    temp.value = item
                    temp.label = item
                    newShippingList.push(temp)
                    setErrorMessage('')
                })
                setShippingMethodList(newShippingList)
                var paymentList = querySnapShot.data().paymentMethod
                var newPaymentList = []
                var temp2 = {}
                paymentList.forEach((item) => {
                    var temp = {}
                    temp.value = item
                    temp.label = item
                    newPaymentList.push(temp)
                    temp2[item] = 0.0          
                })
                setPaymentMethodList(newPaymentList)
                setSplitPaymentMethod(temp2)
            })
            .catch((err) => {
                setErrorMessage('Unable to get Configuration.')
                console.log(err)
            })
            db.collection(userInfo.location).doc('Configuration')
            .get()
            .then((querySnapShot) => {
                setTaxRate(Number(querySnapShot.data().taxRate))
                setErrorMessage('')
            })
            .catch((err) => {
                setErrorMessage('Unable to get the Tax Rate')
                console.log(err)
            })
        }
        catch{
            setErrorMessage('Unable to get the shipping method list and/or the payment method list. Please try again later.')
        }
    }
    useEffect(() => {
        initConfig()
        getCurrentInventory()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    const useStyles = makeStyles((theme) =>({
        root: {
            '& .MuiTextField-root': {
                margin: theme.spacing(3),
                color: 'white'
            }
        }
    }))
    const classes = useStyles()
    const handleBarcode = (data) => {
        setErrorMessage('')
        var seen = false
        var exist = false
        var currentSubtotal = subtotal
        var currentTaxAmount = taxAmount
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
                        currentSubtotal += product.price
                        if(taxApplied && splitPaymentMethod['Credit-Debit Card'] !== 0){
                            currentTaxAmount = Math.round((((taxRate/100) * splitPaymentMethod['Credit-Debit Card']) + Number.EPSILON) * 100) /100
                            console.log('in')
                            console.log(currentSubtotal)
                        }
                        else if(taxApplied && paymentMethod === 'Credit-Debit Card'){
                            currentTaxAmount = Math.round((((taxRate/100) * currentSubtotal) + Number.EPSILON) * 100) /100
                            console.log('here')
                            console.log(currentSubtotal)
                        }
                        else{
                            currentTaxAmount = 0
                        }
                        setSubtotal(currentSubtotal)
                        setTaxAmount(currentTaxAmount)
                        setTotal(currentSubtotal + currentTaxAmount + shippingCost - discountAmount) 
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
                    currentSubtotal += product.price
                    if(taxApplied && splitPaymentMethod['Credit-Debit Card'] !== 0){
                        currentTaxAmount = Math.round((((taxRate/100) * splitPaymentMethod['Credit-Debit Card']) + Number.EPSILON) * 100) /100
                    }
                    else if(taxApplied && paymentMethod === 'Credit-Debit Card'){
                        currentTaxAmount = Math.round((((taxRate/100) * currentSubtotal) + Number.EPSILON) * 100) /100
                    }
                    else{
                        currentTaxAmount = 0
                    }
                    setSubtotal(subtotal + product.price)
                    setTaxAmount(currentTaxAmount)
                    setTotal(currentSubtotal + currentTaxAmount + shippingCost - discountAmount)
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
    const removeProduct = (item) => {
        var currentSubTotal = subtotal
        var currentTaxAmount = taxAmount
        products.forEach((product) => {
            if(product.code === item.code){
                product.quantity += Number(item.quantity)
                currentSubTotal -=  item.price * item.quantity
                if(taxApplied && splitPaymentMethod['Credit-Debit Card'] !== 0){
                    currentTaxAmount = Math.round((((taxRate/100) * splitPaymentMethod['Credit-Debit Card']) + Number.EPSILON) * 100) /100
                }
                else if(taxApplied && paymentMethod === 'Credit-Debit Card'){
                    currentTaxAmount = Math.round((((taxRate/100) * currentSubTotal) + Number.EPSILON) * 100) /100
                }
                else{
                    currentTaxAmount = 0
                }
                setSubtotal(currentSubTotal)
                setTaxAmount(currentTaxAmount)
                setTotal(currentSubTotal + currentTaxAmount + shippingCost - discountAmount)
            }
        })
    }
    const updateProduct = (updatedRow, oldRow) => {
        var currentSubTotal = 0
        var currentTaxAmount = taxAmount
        if(Number(updatedRow.quantity) <= 0 || ((Number(updatedRow.quantity) - Math.floor(Number(updatedRow.quantity))) !== 0)){
            setErrorMessage('Invalid change. Please try again.')
        }
        else {
            if(updatedRow.code === oldRow.code && updatedRow.quantity !== oldRow.quantity){
                currentSubTotal = updatedRow.quantity * updatedRow.price
                if(taxApplied && splitPaymentMethod['Credit-Debit Card'] !== 0){
                    currentTaxAmount = Math.round((((taxRate/100) * splitPaymentMethod['Credit-Debit Card']) + Number.EPSILON) * 100) /100
                }
                else if(taxApplied && paymentMethod === 'Credit-Debit Card'){
                    currentTaxAmount = Math.round((((taxRate/100) * currentSubTotal) + Number.EPSILON) * 100) /100
                }
                else{
                    currentTaxAmount = 0
                }
                setSubtotal(currentSubTotal)
                setTaxAmount(currentTaxAmount)
                setTotal(currentSubTotal + currentTaxAmount + shippingCost - discountAmount)
                products.forEach((product) => {
                    if(product.code === updatedRow.code){
                        product.quantity = product.quantity + Number(oldRow.quantity) - Number(updatedRow.quantity)
                    }
                })
            }
            checkoutItems.forEach((item) => {
                if(item.code === updatedRow.code){
                    item.quantity = Number(updatedRow.quantity)
                }
            })
        }
    }
    const handleCheckout = () => {
        var totalSplitPayment = 0
        if(splitPayment){
            Object.keys(splitPaymentMethod).forEach((item) => {
                totalSplitPayment += Number(splitPaymentMethod[item])
            })
        }
        else{
            paymentMethodList.forEach((item) => {
                if(paymentMethod === item.label){
                    splitPaymentMethod[item.label] = subtotal - discountAmount
                }
            })
        }
        if(shippingMethod === '' || shippingMethod === undefined || shippingMethod === null){
            setErrorMessage('Please provide Shipping Method and try again.')
            return [0, 0, []]
        }
        else if(!splitPayment && (paymentMethod === '' || paymentMethod === undefined || paymentMethod === null)){
            setErrorMessage('Please provide Payment Method and try again.')
            return [0, 0, []]
        }
        else if(checkoutItems === undefined || checkoutItems === null || checkoutItems.length === 0){
            setErrorMessage('Your cart is empty.')
            return [0, 0, []]
        }
        else if(shippingMethod === 'Custom' && shippingCost <= 0){
            setErrorMessage('Please provide a valid Shipping Cost and try again.')
            return [0, 0, []]
        }
        else if(splitPayment && (totalSplitPayment < total || totalSplitPayment > total)){
            setErrorMessage('Please check the total amount of Split Payment and try again.')
            return [0, 0, []]
        }
        else{
            setErrorMessage('')
            var list = []
            var date = new Date()
            var orderNum = Date.now()
            var orderDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
            checkoutItems.forEach((item) => {
                list.push({quantity: item.quantity, description: item.name, unitPrice: item.price, subtotal: (item.price * item.quantity)})
            })
            var orderObj = {orderNum: orderNum, date: orderDate, firstName: firstName, lastName: lastName, coupon: discountAmount, shippingMethod: shippingMethod, shippingCost: shippingCost, paymentMethod: splitPaymentMethod, location: userInfo.location, tax: taxAmount, subtotal: subtotal, total: total, commission: 0.0, status: 'complete', items: list}
            if(userInfo.type === 'user' && (shippingMethod !== 'USPS/UPS Shipping')) {
                orderObj.commission = (Math.round((((15/100) * subtotal) + Number.EPSILON) * 100)) / 100
            }
            db.collection(userInfo.location).doc('SalesSummary').collection(String(date.getFullYear())).doc(String(date.getMonth() + 1))
            .get()
            .then((querySnapshot) => {
                var obj = {}
                if(querySnapshot.data() === undefined){
                    obj['revenue'] = subtotal - discountAmount
                    Object.keys(splitPaymentMethod).forEach((item) => {
                        obj[item] = splitPaymentMethod[item]
                    })
                    if(userInfo.type === 'user' && (shippingMethod !== 'USPS/UPS Shipping')){
                        obj['commission'] = (Math.round((((15/100) * subtotal) + Number.EPSILON) * 100)) / 100
                    }
                    else{
                        obj['commission'] = 0
                    }
                    db.collection(userInfo.location).doc('SalesSummary').collection(String(date.getFullYear())).doc(String(date.getMonth() + 1)).set(obj)
                    .then(
                        setErrorMessage('')
                    )
                    .catch((err) => {
                        setErrorMessage('Unable to update Sale Summary.')
                        console.log(err)
                    })
                }
                else{
                    obj = querySnapshot.data()
                    obj['revenue'] = obj['revenue'] + subtotal - discountAmount
                    if(userInfo.type === 'user' && (shippingMethod !== 'USPS/UPS Shipping')) {
                        obj['commission'] = (Math.round((((15/100) * subtotal) + Number.EPSILON) * 100)) / 100 + obj['commission']
                    }
                    Object.keys(splitPaymentMethod).forEach((item) => {
                        if(obj[item] === undefined || obj[item] === 0){
                            obj[item] = splitPaymentMethod[item]
                        }
                        else{
                            obj[item] = obj[item] + splitPaymentMethod[item]
                        }
                    })
                    db.collection(userInfo.location).doc('SalesSummary').collection(String(date.getFullYear())).doc(String(date.getMonth() + 1)).update(obj)
                    .then(
                        setErrorMessage('')
                    )
                    .catch((err) => {
                        setErrorMessage('Unable to update Sale Summary.')
                        console.log(err)
                    })
                }
            })
            .catch((err) => {
                setErrorMessage('Unable to update Sale Summary.')
                console.log(err)
            })
            setIsComplete(false)
            db.collection(userInfo.location).doc('Orders').collection(String(date.getMonth() + 1) + String(date.getFullYear())).doc(String(orderNum)).set(orderObj)
                .then((docRef) => {
                    db.collection(userInfo.location).doc('Orders').collection('MostRecentOrder').doc('MostRecentOrder').set(orderObj)
                    .then(
                        setErrorMessage('')
                    )
                    .catch((err) => {
                        setErrorMessage('Unable to update Most Recent Order.')
                        console.log(err)
                    })
                    setIsComplete(true)
                    setErrorMessage('')
                }).catch((err) => {
                    setErrorMessage('Unable to place the order. Please try again.')
                    console.log(err)
            })
            checkoutItems.forEach((item) => {
                products.forEach((product) => {
                    if(product.code === item.code){
                        db.collection(userInfo.location).doc('Inventory').collection('Inventory').doc(product.code).update(product)
                        .then(() => {
                            setErrorMessage('')
                            setIsComplete(true)
                        }).catch((err) => {
                            setErrorMessage('Unable to update the product: ' + product.code + ' in the inventory.')
                            console.log(err)
                        })
                    }
                })
            })
            handleClear()
            return [orderNum, orderDate, list]
        }
    }
    const handleClear = () => {
        checkoutItems.forEach((item) => {
            removeProduct(item)
        })
        setCheckoutItems([])
        setSubtotal(0)
        setShippingMethod('')
        setPaymentMethod('')
        setShippingCost(0)
        setCoupon('')
        setFirstName('')
        setLastName('')
        setCustomShippingMethod(false)
        setErrorMessage('')
        setTaxAmount(0)
        setTaxApplied(true)
        setTotal(0)
        setDiscountAmount(0)
        setSplitPayment(false)
        setSplitPaymentMethod()
    }
    const handleShippingChange = (event) => {
        var currentTotal = total
        var newShippingCost = 0
        if(event.target.value === 'USPS/UPS Shipping'){
            newShippingCost = 7.95
            currentTotal += newShippingCost
            setCustomShippingMethod(false)
        }
        else if(event.target.value === 'Custom'){
            newShippingCost = 0
            setCustomShippingMethod(true)
        }
        else{
            newShippingCost = 0
            setCustomShippingMethod(false)
        }
        if(event.target.value !== 'USPS/UPS Shipping' && (shippingMethod === 'USPS/UPS Shipping' || shippingMethod === 'Custom')){
            currentTotal -= shippingCost
        }
        setTotal(currentTotal)
        setShippingCost(newShippingCost)
        setShippingMethod(event.target.value)
    }
    const handlePaymentMethod = (event) => {
        var newPaymentMethod = event.target.value
        var currentTotal = subtotal + shippingCost - discountAmount
        if(taxApplied && event.target.value === 'Credit-Debit Card'){
            var newTaxAmount = Math.round((((taxRate/100) * subtotal) + Number.EPSILON) * 100) / 100
            currentTotal += newTaxAmount
            setTaxAmount(newTaxAmount)
        }
        else{
            setTaxAmount(0)
        }
        setTotal(currentTotal)
        setPaymentMethod(newPaymentMethod)
    }
    const handleCoupon = () => {
        var currentDiscountAmount = 0
        var currentTotal = subtotal + taxAmount + shippingCost
        setCoupon(!coupon)
        setDiscountAmount(currentDiscountAmount)
        setTotal(currentTotal)
    }
    const handleDiscountAmount = (event) => {
        setErrorMessage('')
        var currentTotal = subtotal + taxAmount + shippingCost
        var newDiscountAmount = Number(event.target.value)
        if(newDiscountAmount > currentTotal){
            setErrorMessage('Please provide a valid Discount Amount and try again.')
        }
        else{
            currentTotal -= Number(newDiscountAmount)
            setDiscountAmount(newDiscountAmount)
            setTotal(currentTotal)
        }
    }
    const handleTaxApplied = () => {
        var currentTaxAmount = 0
        var currentTotal = subtotal + shippingCost - discountAmount
        setTaxApplied(!taxApplied)
        if(!taxApplied){
            if(paymentMethod === 'Credit-Debit Card'){
                currentTaxAmount = Math.round((((taxRate/100) * subtotal) + Number.EPSILON) * 100) / 100
                currentTotal += currentTaxAmount
            }
            else if(splitPayment && splitPaymentMethod['Credit-Debit Card']){
                currentTaxAmount = Math.round((((taxRate/100) * splitPaymentMethod['Credit-Debit Card']) + Number.EPSILON) * 100) / 100
                currentTotal += currentTaxAmount
            }
        }
        setTotal(currentTotal)
        setTaxAmount(currentTaxAmount)
    }
    const handleSplitPayment = () => {
        setSplitPayment(!splitPayment)
        setTaxAmount(0)
        setPaymentMethod('')
    }
    const handleSplitPaymentAmount = (event) => {
        setErrorMessage('')
        if(Number(event.target.value) <= 0){
            setErrorMessage('Please provide a valid Amount and try again.')
        }
        else{
            setErrorMessage('')
            splitPaymentMethod[event.target.name] = Number(event.target.value)
            if(taxApplied && event.target.name === 'Credit-Debit Card'){
                var newTaxAmount =  Math.round((((taxRate/100) * splitPaymentMethod[event.target.name]) + Number.EPSILON) * 100) / 100
                setTaxAmount(newTaxAmount)
            }
        }
    }
    const handleFirstName = (event) => {
        setFirstName(event.target.value)
    }
    const handleLastName = (event) => {
        setLastName(event.target.value)
    }
    const handleShippingCost = (event) => {
        var currentTotal = subtotal + taxAmount - discountAmount
        var newShippingCost = Number(event.target.value)
        currentTotal += Number(newShippingCost)
        setShippingCost(newShippingCost)
        setTotal(currentTotal)
    }
    /*const handleCheckoutAndPrint = () => {
        if(shippingMethod === 'Custom' && shippingCost <= 0){
            setErrorMessage('Please provide a valid Shipping Cost and try again.')
        }
        else if(checkoutItems.length > 0 && shippingMethod !== '' && shippingMethod !== null && shippingMethod !== undefined && paymentMethod !== '' && paymentMethod !== null && paymentMethod !== undefined){
            var temp = handleCheckout()
            var doc = new jsPDF('portrait', 'px', 'a5', 'false')
            doc.addImage(image, 'PNG', 15, 15, 120, 47)
            doc.setFont('BonheurRoyale-Regular', 'normal')
            doc.setFontSize(85)
            doc.text(25, 120, 'Thank you')
            doc.setFont('OpenSansCondensed-Light', 'normal')
            doc.setFontSize(20)
            doc.text(180, 140, 'FOR YOUR PURCHASE!')
            doc.setFontSize(11)
            doc.text(20, 160, 'Order #: ' + temp[0])
            doc.text(20, 170, 'Date: ' + temp[1])
            doc.text(20, 180, 'Inventory Location: ' + String(userInfo.location))
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
                    { header: 'Total', dataKey: 'subtotal'}
                ],
                body: temp[2],
              })
            doc.setFont('OpenSansCondensed-Bold', 'normal')
            doc.setFontSize(13)
            doc.text(130, doc.autoTable.previous.finalY + 40, 'Subtotal:')
            doc.text(248, doc.autoTable.previous.finalY + 40,  '$' + String(subtotal))
            doc.text(130, doc.autoTable.previous.finalY + 55, 'Sale Tax (' + String(taxRate) + '%):')
            doc.text(248, doc.autoTable.previous.finalY + 55, '$' + String((Math.round((((taxRate/100) * subtotal) + Number.EPSILON) * 100)) / 100))
            if(coupon.length !== 0){
                doc.text(130, doc.autoTable.previous.finalY + 70, 'Coupon (' + coupon + '):')
                doc.text(248, doc.autoTable.previous.finalY + 70, '$0')
            }

            if(shippingCost !== 0){
                doc.text(130, doc.autoTable.previous.finalY + 85, 'Shipping: ' + shippingMethod)
                doc.text(248, doc.autoTable.previous.finalY + 85, '$' + String(shippingCost))
            }
            doc.setFontSize(15)
            doc.text(130, doc.autoTable.previous.finalY + 110, 'Total:')
            if(shippingCost !== 0){
                doc.text(248, doc.autoTable.previous.finalY + 110, '$' + String(Math.round((((taxRate/100) * subtotal + Number(subtotal) + Number(shippingCost)) + Number.EPSILON) * 100) / 100))
            }
            else {
                doc.text(248, doc.autoTable.previous.finalY + 110, '$' + String(Math.round((((taxRate/100) * subtotal + Number(subtotal)) + Number.EPSILON) * 100) / 100))
            }
            doc.autoPrint()
            doc.output('dataurlnewwindow')
            }
        else if(shippingMethod === '' || shippingMethod === null || shippingMethod === undefined){
            setErrorMessage('Please provide Shipping Method and try again.')
        }
        else if(paymentMethod === '' || paymentMethod === null || paymentMethod === undefined){
            setErrorMessage('Please provide Payment Method and try again.')
        }
        else {
            setErrorMessage('Your cart is empty.')
        }
    }*/   
    const confirmCheckout = () => {
        confirmAlert({
            title: '',
            message: 'Are you sure to checkout?',
            buttons: [
                {
                    label:'Yes',
                    onClick: () => handleCheckout()
                },
                {
                    label: 'No'
                }
            ]
        })
    }
    /*const confirmCheckoutAndPrint = () => {
        confirmAlert({
            title: '',
            message: 'Are you sure to checkout and print the receipt?',
            buttons: [
                {
                    label:'Yes',
                    onClick: () => handleCheckoutAndPrint()
                },
                {
                    label: 'No'
                }
            ]
        })
    }*/

    if(isComplete){
        return (
            <div style={{position:'absolute', width: '80vw', paddingTop: '2%', paddingBottom: '2%', paddingRight: '2%'}}>
                <BarcodeReader minLength={4} onScan={handleBarcode} onError={handleError}></BarcodeReader>
                <br/>{errorMessage && <Alert color='danger'>{errorMessage}</Alert>}
                <h1 style={{padding: '3%', fontWeight: 'bolder'}}>ORDER INFO</h1>
                <form className={classes.root}>
                    <TextField
                        variant='standard'
                        name='firstName'
                        label='First Name'
                        value={firstName}
                        style ={{width: '18%'}}
                        onChange={handleFirstName}
                    />
                    <TextField
                        variant='standard'
                        name='lastName'
                        label='Last Name'
                        value={lastName}
                        style ={{width: '18%'}}
                        onChange={handleLastName}
                    /><br/>
                    <TextField
                        id='standard-select-currency'
                        select 
                        required={true}
                        label='Shipping Method'
                        value={shippingMethod}
                        style = {{width: '35%'}}
                        variant='standard'
                        onChange={handleShippingChange}
                        error={shippingMethod === null || shippingMethod === undefined || shippingMethod === ''}>
                        {shippingMethodList.map((option) => {
                            return <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        })}
                    </TextField>
                    {splitPayment ?
                        <TextField
                            id='standard-select-currency'
                            select
                            disabled
                            required={true}
                            label='Payment Method'
                            value={paymentMethod}
                            style = {{width: '35%'}}
                            variant='standard'
                            onChange={handlePaymentMethod}
                            error={paymentMethod === null || paymentMethod === undefined || paymentMethod === ''}>
                            {paymentMethodList.map((option) => {
                                return <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            })}
                        </TextField> :
                        <TextField
                            id='standard-select-currency'
                            select
                            required={true}
                            label='Payment Method'
                            value={paymentMethod}
                            style = {{width: '35%'}}
                            variant='standard'
                            onChange={handlePaymentMethod}
                            error={paymentMethod === null || paymentMethod === undefined || paymentMethod === ''}>
                            {paymentMethodList.map((option) => {
                                return <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            })}
                        </TextField>
                    }
                </form>
                <FormControl>
                    <FormGroup>
                        <Row>
                            <Col>
                                <FormControlLabel
                                    control={
                                        <Checkbox color='default' checked={taxApplied} onChange={handleTaxApplied} name='taxApplied'/>
                                    }
                                    label='Tax Applied'
                                />
                            </Col>
                            <Col>
                                <FormControlLabel
                                    control={
                                        <Checkbox color='default' checked={splitPayment} onChange={handleSplitPayment} name='splitPayment'/>
                                    }
                                    label='Split Payment'
                                />
                            </Col>
                            <Col>
                                <FormControlLabel
                                    control={
                                        <Checkbox color='default' checked={coupon} onChange={handleCoupon} name='coupon'/>
                                    }
                                    label='Coupon(s) Applied'
                                />
                            </Col>
                        </Row>
                    </FormGroup>
                </FormControl>
                <Row>
                    <Col>
                        {(splitPayment && splitPaymentMethod !== null && splitPaymentMethod !== undefined) && Object.keys(splitPaymentMethod).map((item) => {
                            return <Row style={{padding: '1%'}}>
                                <TextField
                                    variant='standard'
                                    name={item}
                                    label={item}
                                    key={item}
                                    value={splitPayment[item]}
                                    onChange={handleSplitPaymentAmount}
                                    style={{width: '60%'}}
                                    InputProps={{
                                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                                    }}
                                    type='number'
                                />
                                </Row>
                        })}
                    </Col>
                    <Col>
                        {customShippingMethod && <div style={{width: '100%'}}>
                            <TextField
                                variant='standard'
                                name='customShippingPrice'
                                label='Shipping Cost'
                                value={shippingCost}
                                style ={{width: '30%'}}
                                error={shippingCost <= 0}
                                type='number'
                                onChange={handleShippingCost}
                                InputProps={{
                                    startAdornment: <InputAdornment position='start'>$</InputAdornment>
                                }}
                            /></div>
                        }
                        {coupon && <div style={{paddingTop: '3%', fontWeight: 'bolder'}}>
                            <TextField
                            variant='standard'
                            name='discountAmount'
                            label='Discount Amount'
                            value={discountAmount}
                            style={{width: '30%'}}
                            error={discountAmount <= 0}
                            type='number'
                            onChange={handleDiscountAmount}
                            InputProps={{
                                startAdornment: <InputAdornment position='start'>$</InputAdornment>
                            }}
                        /></div>
                        }
                    </Col>
                </Row>
                <h1 style={{padding: '3%', fontWeight: 'bolder'}}>CART</h1>
                <MaterialTable
                     columns={columns} 
                     data={checkoutItems} 
                     title=''
                     editable={{
                        onRowDelete:selectedRow => new Promise((resolve, reject) => {
                            const index = selectedRow.tableData.id
                            const updatedCheckoutItems = [...checkoutItems]
                            updatedCheckoutItems.splice(index, 1)
                            setTimeout(() => {
                                setCheckoutItems(updatedCheckoutItems)
                                removeProduct(selectedRow)
                                resolve()
                            }, 2000)
                        }),
                        onRowUpdate:(updatedRow, oldRow) => new Promise((resolve, reject) => {
                            const index = oldRow.tableData.id
                            const updatedCheckoutItems = [...checkoutItems]
                            updatedCheckoutItems[index] = updatedRow
                            setTimeout(() => {
                                setCheckoutItems(updatedCheckoutItems)
                                updateProduct(updatedRow, oldRow)
                                resolve()
                            }, 2000)
                        })
                     }}
                     options={{
                         actionsColumnIndex:-1, addRowPosition:'first', pageSize:10, pageSizeOptions:[10, 15, 20, 30], search: false
                     }}
                     />
                     <h5 style={{paddingTop: '3%', paddingLeft: '70%', fontWeight: 'bolder'}}>Subtotal: ${subtotal}</h5>
                     <h5 style={{padding: '3%', paddingLeft: '70%', fontWeight: 'bolder'}}>Sale Tax ({taxRate}%): ${taxAmount}</h5>
                     {discountAmount !== 0 && <h5 style={{paddingTop: '3%', paddingLeft: '70%', fontWeight: 'bolder'}}>Discount Amount: -${discountAmount}</h5>}
                     {shippingCost !== 0 && <h5 style={{paddingTop: '3%', paddingLeft: '70%', fontWeight: 'bolder'}}>Shipping ({shippingMethod}): ${shippingCost}</h5>}
                     <h4 style={{padding: '3%', paddingLeft: '70%', fontWeight: 'bolder'}}>Total: ${total}</h4>
                     <Row className='buttonGroup'>
                         <Col><Button variant='outlined' onClick={confirmCheckout}>CHECK OUT</Button></Col>
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
