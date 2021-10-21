import React, {useState} from 'react'
import MaterialTable from 'material-table'
import { db } from '../firebase'
import {useAuth} from '../Context/AuthContext'
import { makeStyles, TextField, MenuItem } from '@material-ui/core'
import { Button } from '@material-ui/core'
import { Row, Col, Alert, Label, Input } from 'reactstrap'

export default function RefundComponent() {
    const [isComplete, setIsComplete] = useState(true)
    const [orderNum, setOrderNum] = useState('')
    const [orderDate, setOrderDate] = useState('')
    const [order, setOrder] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [copq, setCOPQ] = useState()
    const [paymentMethod, setPaymentMethod] = useState('')
    const { userInfo } = useAuth()
    const columns = [
        {title: 'Order #', field: 'orderNum', editable: 'never'},
        {title: 'Date', field: 'date', editable: 'never'},
        {title: 'Total', field: 'total', editable: 'never'},
        {title: 'Payment Method', field: 'paymentMethod', editable: 'never'},
        {title: 'Shipping Method', field: 'shippingMethod', editable: 'never'},
        {title: 'Refund Amount', field: 'refund', type:'numeric'}
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
    const handleChangeInput = (event, type) => {
        var temp = String(event.target.value)
        setOrderNum(temp)
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
                    var temp = []
                    temp.push(querySnapshot.data())
                    temp[0].refund = 0.0
                    setOrder(temp)
                    setErrorMessage('')
                }
                else{
                    setOrder([])
                    setErrorMessage('Cannot find the order. Please try again.')
                }
                setIsComplete(true)
            })
        }
    }
    const handleRefund = (updatedRow) => {
        setIsComplete(false)
        var temp = orderDate.split('')
        var month = temp[0] + temp[1]
        var year = temp[2] + temp[3] + temp[4] + temp[5]
        db.collection(userInfo.location).doc('SalesSummary').collection(year).doc(month)
        .get()
        .then((querySnapshot) => {
            var newSummary = querySnapshot.data()
            newSummary.revenue -= updatedRow.refund
            if(userInfo.type === 'user' && (updatedRow.shippingMethod === 'In-person' || updatedRow.shippingMethod === 'Next-day')){
                newSummary.commission -= order[0].commission
            }
            newSummary[updatedRow.paymentMethod] -= order[0].subtotal
            db.collection(userInfo.location).doc('SalesSummary').collection(year).doc(month).update(newSummary)
            var refundObj = {}
            var date = new Date()
            refundObj['orderNum'] = order[0].orderNum
            refundObj['refundAmount'] = updatedRow.refund
            refundObj['date'] = String(date.getFullYear()) + '-' + String(date.getMonth() + 1) + '-' + String(date.getDate())
            db.collection(userInfo.location).doc('RefundHistory').collection(String(date.getMonth() + 1) + String(date.getFullYear())).doc(String(Date.now())).set(refundObj)
            db.collection(userInfo.location).doc('Orders').collection(String(date.getMonth() + 1) + String(date.getFullYear())).doc(String(order[0].orderNum)).update({status: 'refunded'})
        })
        setIsComplete(true)
    }
    const handleChangeCOPQ = (event) =>{
        setErrorMessage('')
        var value = event.target.value
        console.log(typeof value)
        if(value === undefined || value === null || Number(value) <= 0){
            setErrorMessage('Please provide a valid COPQ and try again.')
        }
        else{
            setCOPQ(value)
        }
    }
    const handlePaymentMethod = (event) => {
        setPaymentMethod(event.target.value)
    }
    const handleCOPQSubmit = () => {
        var date = new Date()
        db.collection(userInfo.location).doc('SalesSummary').collection(String(date.getFullYear())).doc(String(date.getMonth() + 1))
        .get()
        .then((querySnapshot) => {
            var summary = querySnapshot.data()
            if(summary === undefined || summary === null){
                setErrorMessage('No transation has been made this month. Please try again later.')
            }
            else{
                db.collection(userInfo.location).doc('SalesSummary').collection(String(date.getFullYear())).doc(String(date.getMonth() + 1)).update({revenue : summary.revenue - copq, paymentMethod: paymentMethod - copq })
                var COPQObj = {
                    date: String(date.getFullYear) + '-' + String(date.getMonth + 1) + '-' + String(date.getDate()),
                    COPQAmount: copq,
                    paymentMethod: paymentMethod
                }
                db.collection(userInfo.location).doc('COPQHistory').collection(String(date.getMonth() + 1) + String(date.getFullYear())).doc(String(Date.now())).set(COPQObj)
            }
        })
    }
    const handleClear = () => {
        setOrderNum('')
        setOrderDate('')
        setOrder([])
        setErrorMessage('')
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
                {(order[0] !== undefined && order[0] !== null) && <MaterialTable
                     columns={columns} 
                     data={order} 
                     title='ORDER'
                     editable={{
                        onRowUpdate:(updatedRow, oldRow) => new Promise((resolve, reject) => {
                            if(updatedRow.refund <= 0 || updatedRow.total < updatedRow.refund){
                                setErrorMessage('Invalid refund amount. Please try again.')
                                resolve()
                            }
                            else{
                                setTimeout(() => {
                                    handleRefund(updatedRow)
                                    handleClear()
                                    resolve()
                                }, 2000)
                            }
                        })
                     }}
                     options={{
                         actionsColumnIndex:-1, addRowPosition:'first', pageSize:1, pageSizeOptions:[]
                     }}
                />}
                </Row>
                <Row className='buttonGroup'>
                    <Col><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleSubmit}>SEARCH</Button></Col>
                    <Col><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleClear}>CLEAR</Button></Col>
                </Row>
                <br/><br/><hr/>
                <h1 style={{padding: '3%', fontWeight: 'bolder'}}>LOST, DAMAGED AND DEFECTED ITEM REPORT (DETAILS NEEDED)</h1>
                <Row>
                    <Col>
                        <form className={classes.root}>
                            <TextField
                                variant='standard'
                                name='copq'
                                type='number'
                                label='COPQ'
                                value={copq}
                                required={true}
                                style={{width: '45%'}}
                                onChange={event => handleChangeCOPQ(event)}
                                error={String(orderNum).length === 0 || orderNum === null}
                            />
                        </form>
                    </Col>
                    <Col>
                        <TextField
                        id='standard-select-currency'
                    select
                    label='Payment Method'
                    value={paymentMethod}
                    style = {{width: '35%'}}
                    variant='standard'
                        onChange={handlePaymentMethod}>
                        <MenuItem key='Cash' value='Cash'>Cash</MenuItem>
                        <MenuItem key='Credit-Debit Card' value='Credit-Debit Card'>Credit/Debit Card</MenuItem>
                        <MenuItem key='CashApp' value='CashApp'>CashApp</MenuItem>
                        <MenuItem key='Venmo' value='Venmo'>Venmo</MenuItem>
                        <MenuItem key='Paypal' value='Paypal'>Paypal</MenuItem>
                        <MenuItem key='Others' value='Others'>Others</MenuItem>
                        </TextField>
                    </Col>
                </Row>
                <div className={'buttonGroup'}>
                    <Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleCOPQSubmit}>SUBMIT</Button>
                </div>
            </div>
        )
    }
    else{
        return(
            <div></div>
        )
    }
}
