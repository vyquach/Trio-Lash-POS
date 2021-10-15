import React, {useState} from 'react'
import MaterialTable from 'material-table'
import { db } from '../firebase'
import {useAuth} from '../Context/AuthContext'
import { makeStyles, TextField } from '@material-ui/core'
import { Button } from '@material-ui/core'
import { Row, Col, Alert, Label, Input } from 'reactstrap'

export default function RefundComponent() {
    const [isComplete, setIsComplete] = useState(true)
    const [orderNum, setOrderNum] = useState('')
    const [orderDate, setOrderDate] = useState('')
    const [order, setOrder] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const { userInfo } = useAuth()
    const columns = [
        {title: 'Order #', field: 'orderNum'},
        {title: 'Date', field: 'date'},
        {title: 'Total', field: 'total'},
        {title: 'Payment Method', field: 'paymentMethod'},
        {title: 'Shipping Method', field: 'shippingMethod'}
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
                if(querySnapshot.data() !== undefined && querySnapshot.data() !== null){
                    var temp = []
                    temp.push(querySnapshot.data())
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
    const handleClear = () => {
        setOrderNum('')
        setOrderDate('')
        setOrder([])
        setErrorMessage('')
    }
    if(isComplete){
        console.log(order)
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
                     options={{
                         actionsColumnIndex:-1, addRowPosition:'first', pageSize:1, pageSizeOptions:[]
                     }}
                />}
                </Row>
                <Row className='buttonGroup'>
                    <Col><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleSubmit}>SEARCH</Button></Col>
                    <Col><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleClear}>CLEAR</Button></Col>
                </Row>
            </div>
        )
    }
    else{
        return(
            <div></div>
        )
    }
}
