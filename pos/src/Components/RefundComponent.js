import React, {useState, useEffect} from 'react'
import MaterialTable from 'material-table'
import { db } from '../firebase'
import {useAuth} from '../Context/AuthContext'
import { makeStyles, TextField, MenuItem } from '@material-ui/core'
import { Button } from '@material-ui/core'
import { Row, Col, Alert, Label, Input } from 'reactstrap'

export default function RefundComponent() {
    const [isComplete, setIsComplete] = useState(true)
    const [products, setProducts] = useState([])
    const [orderNum, setOrderNum] = useState('')
    const [orderDate, setOrderDate] = useState('')
    const [order, setOrder] = useState({})
    const [errorMessage, setErrorMessage] = useState('')
    const [refundAmount, setRefundAmount] = useState()
    const [codesList, setCodesList] = useState([])
    const [selectedItem, setSelectedItem] = useState('')
    const [lostQuantity, setLostQuantity] = useState(0)
    const [lostCost, setLostCost] = useState(0)
    const [totalLostCost, setTotalLostCost] = useState(0)
    const [defectedItemList, setDefectedItemList] = useState([])
    const { userInfo } = useAuth()
    const columns = [
        {title: 'Quantity', field: 'quantity'},
        {title: 'Description', field: 'description'},
        {title: 'Subtotal', field: 'subtotal'},
        {title: 'Unit Price', field: 'unitPrice'}
    ]
    const copqColumns = [
        {title: 'Code', field: 'code', editable: 'never'},
        {title: 'Lost/Defected QTy', field: 'lostQuantity', type: 'numeric', editable: 'never'},
        {title: 'Lost/Defected Cost', field: 'lostCost', type: 'numeric', editable: 'never'},
        {title: 'Total', field: 'total', type: 'numeric', editable: 'never'}
    ]
    const useStyles = makeStyles((theme) =>({
        root: {
            '& .MuiTextField-root': {
                margin: theme.spacing(1),
                color: 'white'
            }
        }
    }))
    const classes = useStyles()
    const getCurrentInventory = () => {
        setProducts([])
        db.collection(userInfo.location).doc('Inventory').collection('Inventory')
        .get()
        .then((querySnapshot) => {
            var temp = []
            querySnapshot.docs.forEach((doc) => {
                var obj = {}
                obj.value = doc.data().code
                obj.label = doc.data().code
                temp.push(obj)
                setProducts(products => [...products, doc.data()])
            })
            setCodesList(temp)
            setErrorMessage('')
        })
        .catch((err) => {
            setErrorMessage('Unable to get the details of the inventory.')
            console.log(err)
        })
        setIsComplete(true)
    }
    useEffect(() => {
        getCurrentInventory()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    const handleChangeInput = (event, type) => {
        if(type === null || type === undefined || type === ''){
            var temp = String(event.target.value)
            setOrderNum(temp)
        }
        else if(type === 'quantity'){
            setLostQuantity(Number(event.target.value))
        }
        else if(type === 'cost'){
            setLostCost(Number(event.target.value))
        }
    }
    const handleChangeDate = (event) => {
        var date = event.target.value
        var temp = event.target.value.split('-')
        date = temp[1] + temp[0]
        setOrderDate(date)
    }
    const handleSubmit = () => {
        if(orderNum.length === 0 || orderNum === null || orderDate.length === 0 || orderDate === null){
            setErrorMessage('Please provide valid Order # and Date.')
        }
        else{
            setIsComplete(false)
            db.collection(userInfo.location).doc('Orders').collection(orderDate).doc(orderNum)
            .get()
            .then((querySnapshot) => {
                if(querySnapshot.data() !== undefined && querySnapshot.data() !== null && querySnapshot.data().status === 'complete'){
                    console.log(querySnapshot.data())
                    setOrder(querySnapshot.data())
                    setErrorMessage('')
                }
                else{
                    setOrder([])
                    setErrorMessage('Cannot find the order. Please try again.')
                }
                setIsComplete(true)
                setErrorMessage('')
            })
            .catch((err) => {
                setErrorMessage('Unable to get the details of the order.')
                console.log(err)
            })
        }
    }
    const handleRefund = (updatedRow) => {
        setIsComplete(false)
        if(refundAmount === undefined || refundAmount === null || Number(refundAmount) <= 0 || Number(refundAmount) > order.total){
            setErrorMessage('Please provide a valid Refund Amount and try again.')
        }
        else{
            var temp = orderDate.split('')
            var month = temp[0] + temp[1]
            var year = temp[2] + temp[3] + temp[4] + temp[5]
            db.collection(userInfo.location).doc('SalesSummary').collection(year).doc(month)
            .get()
            .then((querySnapshot) => {
                var newSummary = querySnapshot.data()
                newSummary.revenue -= refundAmount
                if(userInfo.type === 'user' && (order.shippingMethod === 'In-person' || order.shippingMethod === 'Next-day')){
                    newSummary.commission -= order.commission
                }
                newSummary[order.paymentMethod] -= refundAmount
                db.collection(userInfo.location).doc('SalesSummary').collection(year).doc(month).update(newSummary)
                var refundObj = {}
                var date = new Date()
                refundObj['orderNum'] = order.orderNum
                refundObj['refundAmount'] = refundAmount
                refundObj['date'] = String(date.getFullYear()) + '-' + String(date.getMonth() + 1) + '-' + String(date.getDate())
                db.collection(userInfo.location).doc('RefundHistory').collection(String(date.getMonth() + 1) + String(date.getFullYear())).doc(String(Date.now())).set(refundObj)
                .then(
                    db.collection(userInfo.location).doc('Orders').collection(String(date.getMonth() + 1) + String(date.getFullYear())).doc(String(order.orderNum)).update({status: 'refunded'})
                    .then()
                    .catch((err) => {
                        setErrorMessage('Unable to update the status of the order.')
                        console.log(err)
                    })
                )
                .catch((err) => {
                    setErrorMessage('Unable to update Refund Record.')
                    console.log(err)
                })
            })
                handleClear()
        }
        setIsComplete(true)
    }
    const handleChangeRefundAmount = (event) => {
        setRefundAmount(Number(event.target.value))
    }
    const handleCodeChange = (event) => {
        setSelectedItem(event.target.value)
    }
    const handleAddSelectedItem = () => {
        setErrorMessage('')
        products.forEach((item) => {
            if(item.code === selectedItem && item.quantity >= lostQuantity){
                var obj = {}
                obj.code = selectedItem
                obj.lostQuantity = lostQuantity
                obj.lostCost = lostCost
                obj.total = Number(lostCost) * Number(lostQuantity)
                setDefectedItemList(defectedItemList => [...defectedItemList, obj])
                setSelectedItem('')
                setLostCost(0)
                setLostQuantity(0)
                setTotalLostCost(totalLostCost + lostCost)
            }
            else if(item.code === selectedItem && item.quantity < lostQuantity){
                setErrorMessage('Please provide a valid quantity and try again.')
            }
        })
    }
    const handleClear = () => {
        setOrderNum('')
        setOrderDate('')
        setOrder({})
        setRefundAmount()
        setErrorMessage('')
    }
    const submitDefectedItem = () => {
        let date = new Date()
        let currentDate = String(date.getMonth() + 1) + '-' + String(date.getDate()) + '-' + String(date.getFullYear())
        let obj = {
            date: currentDate,
            defectedItemList: defectedItemList,
            totalCost: totalLostCost
        }
        defectedItemList.forEach((item) => {
            let temp = {}
            products.forEach((product) => {
                if(product.code === item.code){
                    temp = product
                    temp.quantity -= item.lostQuantity
                    db.collection(userInfo.location).doc('Inventory').collection('Inventory').doc(item.code).update(temp)
                    .then()
                    .catch((err) => {
                        setErrorMessage('Unable to record the change.')
                        console.log(err)
                    })
                }
            })
        })
        db.collection(userInfo.location).doc('Lost/DefectionReport').collection(String(date.getMonth() + 1) + String(date.getFullYear())).doc(String(Date.now())).set(obj)
        .then(
            clearDefectedItem()
        ).catch((err) => {
            setErrorMessage('Unable to record the change.')
            console.log(err)
        })
    }
    const clearDefectedItem = () => {
        setErrorMessage('')
        setDefectedItemList([])
        setTotalLostCost(0)
    }
    if(isComplete){
        return (
            <div style={{position: 'absolute', width: '80vw', paddingTop: '2%', paddingBottom: '2%', paddingRight: '2%'}}>
                <h1 style={{padding: '3%', fontWeight: 'bolder'}}>REFUND</h1>
                {errorMessage && <Alert color='danger'>{errorMessage}</Alert>}
                <Row>
                    <Col>
                        <form className={classes.root}>
                            <TextField
                                variant='standard'
                                name='orderNum'
                                label='Order Number'
                                value={orderNum}
                                required={true}
                                style={{width: '45%'}}
                                onChange={event => handleChangeInput(event)}
                                error={String(orderNum).length === 0 || orderNum === null}
                            />
                        </form>
                    </Col>
                    <Col>
                        <Label>Order Date</Label>
                        <Input
                            type="date"
                            name="orderDate"
                            id="orderDate"
                            required={true}
                            onChange={handleChangeDate}
                        />
                    </Col>
                </Row><br/>
                <Row>
                {Object.keys(order).length !== 0 && <MaterialTable
                     columns={columns} 
                     data={order.items} 
                     title='ITEM(S) PURCHASED'
                     options={{
                         actionsColumnIndex:-1, addRowPosition:'first', pageSize:5, pageSizeOptions:[5, 7, 10, 15]
                     }}
                />}
                </Row>
                {Object.keys(order).length !== 0 && <Row style={{paddingTop: '3%'}}>
                <span>
                    <span style={{float: 'left'}}>
                        <h4 style={{fontWeight: 'bolder'}}>ORDER DETAILS:</h4>
                        <h6>Date: {order.date}</h6>
                        <h6>Shipping Method: {order.shippingMethod}</h6>
                        <h6>Payment Method: {order.paymentMethod}</h6>
                        <h6>Coupon(s) Applied: {order.coupon}</h6>
                        <h6>Total: ${order.total}</h6>
                    </span>
                    <span style={{float: 'right'}}>
                        <h4 style={{fontWeight: 'bolder'}}>REFUND:</h4>
                        <form className={classes.root}>
                            <TextField
                                variant='standard'
                                name='refundAmount'
                                type='number'
                                label='Amount'
                                value={refundAmount}
                                required={true}
                                style={{width: '45%'}}
                                onChange={event => handleChangeRefundAmount(event)}
                                error={refundAmount === undefined || refundAmount === null || Number(refundAmount) <= 0 || Number(refundAmount) > order.total}
                            />
                        </form>
                    </span>
                </span>
                </Row>}
                <Row className='buttonGroup'>
                    <Col><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleSubmit}>SEARCH</Button></Col>
                    {Object.keys(order).length !== 0 && <Col><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleRefund}>REFUND</Button></Col>}
                    <Col><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleClear}>CLEAR</Button></Col>
                </Row>
                <br/><br/><hr/>
                <h1 style={{padding: '3%', fontWeight: 'bolder'}}>LOST, DAMAGED AND DEFECTED ITEM REPORT</h1>
                <TextField
                    id='standard-select-currency'
                    select
                    required={true}
                    label='Products'
                    value={selectedItem}
                    style = {{width: '35%'}}
                    variant='standard'
                    onChange={handleCodeChange}
                    error={selectedItem === null || selectedItem === undefined || selectedItem === ''}>
                    {codesList.map((option) => {
                        return <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    })}
                </TextField><br/><br/><br/>
                {(selectedItem !== null && selectedItem !== undefined && selectedItem !== '') &&
                    <div className={classes.root}>
                        <TextField
                            variant='standard'
                            name='quantity'
                            label='Quantity'
                            value={lostQuantity}
                            required={true}
                            type='number'
                            style={{width: '20%'}}
                            onChange={event => handleChangeInput(event, 'quantity')}
                            error={Number(lostQuantity) <= 0}
                        />
                        <TextField
                            variant='standard'
                            name='lostCost'
                            label='Cost'
                            value={lostCost}
                            required={true}
                            type='number'
                            style={{width: '20%'}}
                            onChange={event => handleChangeInput(event, 'cost')}
                            error={Number(lostCost) <= 0}
                        />
                        <br/><br/><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleAddSelectedItem}>ADD</Button><br/><br/>
                    </div>}
                <MaterialTable
                     columns={copqColumns} 
                     data={defectedItemList} 
                     title=''
                     editable={{
                        onRowDelete:selectedRow => new Promise((resolve, reject) => {
                            setTimeout(() => {
                                var temp = []
                                defectedItemList.forEach((item) => {
                                    if(item.code !== selectedRow.code){
                                        temp.push(item)
                                    }
                                })
                                setDefectedItemList(temp)
                                resolve()
                            }, 2000)
                        })
                     }}
                     options={{
                         actionsColumnIndex:-1, addRowPosition:'first', pageSize:5, pageSizeOptions:[5,7,10,15]
                     }}
                />
                <br/>{(totalLostCost !== 0) && <h4 style={{paddingLeft: '70%', fontWeight: 'bolder'}}>Total: ${((Math.round((totalLostCost + Number.EPSILON) * 100)) / 100)}</h4>}
                {(defectedItemList.length !== 0) && 
                    <Row className={'buttonGroup'}>
                        <Col><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={submitDefectedItem}>REPORT</Button></Col>
                        <Col><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={clearDefectedItem}>CLEAR</Button></Col>
                </Row>}
            </div>
        )
    }
    else{
        return(
            <div></div>
        )
    }
}
