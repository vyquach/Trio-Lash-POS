import React, {useState, useRef} from 'react'
import { makeStyles, TextField, MenuItem, Button } from '@material-ui/core'
import { Label, Alert, Input, Row, Col } from 'reactstrap'
import MaterialTable from 'material-table'
import { db } from '../firebase'
import {useAuth} from '../Context/AuthContext'
import { CSVLink } from 'react-csv'

export default function SearchComponent() {
    const [orderList, setOrderList] = useState([])
    const [restockList, setRestockRList] = useState([])
    const [refundList, setRefundList] = useState([])
    const [lostAndDefectionList, setLostAndDefectionList] = useState([])
    const [year, setYear] = useState('')
    const [month, setMonth] = useState('')
    const [date, setDate] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isComplete, setIsComplete] = useState(true)
    const { userInfo } = useAuth()
    const [option, setOption] = useState('')
    const [data, setData] = useState([])
    const csvLink = useRef()
    const options = [
        {value: 'orderRecords', label: 'Order Record(s)'},
        {value: 'restockRecords', label: 'Restock Record(s)'},
        {value: 'refundRecords', label: 'Refund Record(s)'},
        {value: 'lostAndDefectionRecords', label: 'Lost/Defection Record(s)'}
    ]
    const orderColumns = [
        {title: 'Order #', field: 'orderNum'},
        {title: 'Date', field: 'date'},
        {title: 'First Name', field: 'firstName'},
        {title: 'Last Name', field: 'lastName'},
        {title: 'Total', field: 'total'},
        {title: 'Commission', field: 'commission'},
        {title: 'Status', field: 'status'}
    ]
    const refundColumns = [
        {title: 'Order #', field: 'orderNum'},
        {title: 'Date', field: 'date'},
        {title: 'Refund Amount', field: 'refundAmount'}
    ]
    const restockColumns = [
        {title: 'Date', field: 'date'},
        {title: 'Code', field: 'code'},
        {title: 'Name', field: 'name'},
        {title: 'Description', field: 'description'},
        {title: 'Ventor', field: 'ventor'},
        {title: 'Restock Qty', field: 'restock'},
        {title: 'Restock WSP', field: 'restockWSP'},
    ]
    const lostAndDefectionColumns = [
        {title: 'Date', field: 'date'},
        {title: 'Total Cost', field: 'totalCost'}
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
    const handleChangeDate = (event) => {
        var date = event.target.value
        var temp = event.target.value.split('-')
        date = temp[1] + temp[0]
        switch (temp[1]){
            case '01':
                setMonth('JAN')
                break
            case '02':
                setMonth('FEB')
                break
            case '03':
                setMonth('MAR')
                break
            case '04':
                setMonth('APR')
                break
            case '05':
                setMonth('MAY')
                break
            case '06':
                setMonth('JUN')
                break
            case '07':
                setMonth('JUL')
                break
            case '08':
                setMonth('AUG')
                break
            case '09':
                setMonth('SEP')
                break
            case '10':
                setMonth('OCT')
                break
            case '11':
                setMonth('NOV')
                break
            case '12':
                setMonth('DEC')
                break       
            default:
                setMonth('')         
        }
        setYear(temp[0])
        setDate(date)
    }
    const handleChangeOption = (event) => {
        setOption(event.target.value)
    }
    const handleSubmit = () => {
        if(date === null || date === undefined || date.length === 0 || option === null || option === undefined || option.length === 0){
            setErrorMessage('Please provide valid Date and Type of Reports.')
        }
        else if(option === 'orderRecords'){
            setIsComplete(false)
            db.collection(userInfo.location).doc('Orders').collection(date)
            .get()
            .then((querySnapshot) => {
                if(querySnapshot.docs !== undefined && querySnapshot.docs !== null){
                    var temp = []
                    querySnapshot.docs.forEach((item) => {
                        temp.push(item.data())
                    })
                    setOrderList(temp)
                    setErrorMessage('')
                }
                else{
                    setErrorMessage('Cannot retrieve Order Record(s). Please try again.')
                }
                setIsComplete(true)
                setErrorMessage('')
            })
            .catch((err) => {
                setErrorMessage('Unable to get Order Record(s).')
                console.log(err)
            })
        }
        else if(option === 'refundRecords'){
            setIsComplete(false)
            db.collection(userInfo.location).doc('RefundHistory').collection(date)
            .get()
            .then((querySnapshot) => {
                if(querySnapshot.docs !== undefined && querySnapshot.docs !== null){
                    var temp = []
                    querySnapshot.docs.forEach((item) => {
                        temp.push(item.data())
                    })
                    setRefundList(temp)
                    setErrorMessage('')
                }
                else{
                    setErrorMessage('Cannot retrieve Refund Record(s). Please try again.')
                }
                setIsComplete(true)
                setErrorMessage('')
            })
            .catch((err) => {
                setErrorMessage('Unable to get Refund Record(s).')
                console.log(err)
            })
        }
        else if(option === 'restockRecords'){
            setIsComplete(false)
            db.collection(userInfo.location).doc('RestockHistory').collection(date)
            .get()
            .then((querySnapshot) => {
                if(querySnapshot.docs !== undefined && querySnapshot.docs !== null){
                    var temp = []
                    querySnapshot.docs.forEach((item) => {
                        temp.push(item.data())
                    })
                    setRestockRList(temp)
                    setErrorMessage('')
                }
                else{
                    setErrorMessage('Cannot retrieve Restock Record(s). Please try again.')
                }
                setIsComplete(true)
                setErrorMessage('')
            })
            .catch((err) => {
                setErrorMessage('Unable to get Restock Record(s).')
                console.log(err)
            })
        }
        else if(option === 'lostAndDefectionRecords'){
            setIsComplete(false)
            db.collection(userInfo.location).doc('LostAndDefectionReport').collection(date)
            .get()
            .then((querySnapshot) => {
                if(querySnapshot.docs !== undefined && querySnapshot.docs !== null){
                    var temp = []
                    querySnapshot.docs.forEach((item) => {
                        temp.push(item.data())
                    })
                    setLostAndDefectionList(temp)
                    setErrorMessage('')
                }
                else{
                    setErrorMessage('Cannot retrieve Lost/Defection Record(s). Please try again.')
                }
                setIsComplete(true)
                setErrorMessage('')
            })
            .catch((err) => {
                setErrorMessage('Unable to get Lost/Defection Record(s).')
                console.log(err)
            })
        }
        setDate('')
    }
    const getExcelData = async () => {
        if(date === null || date === undefined || date.length === 0 || option === null || option === undefined || option.length === 0){
            setErrorMessage('Please provide valid Date and Type of Reports.')
        }
        else{
            await db.collection(userInfo.location).doc('Orders').collection(date)
            .get()
            .then((querySnapshot) => {
                var excelData = []
                var temp = {}
                var index = 1
                if(querySnapshot.docs !== undefined && querySnapshot.docs !== null){
                    querySnapshot.docs.forEach((item) => {
                        temp['num'] = index
                        temp['orderNum'] = item.data().orderNum
                        var dateArr = item.data().date.split('-')
                        temp['date'] =  dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0]
                        temp['status'] = item.data().status 
                        temp['shippingMethod'] = item.data().shippingMethod
                        temp['shippingCost'] = item.data().shippingCost
                        temp['coupon'] = -item.data().coupon
                        temp['commission'] = item.data().commission
                        temp['total'] = item.data().total
                        Object.keys(item.data().paymentMethod).forEach((each) => {
                            temp[each] = item.data().paymentMethod[each]
                        })
                        excelData.push(temp)
                        temp = {}
                        index += 1
                    })
                    setData(excelData)
                }
                else{
                    setErrorMessage('Cannot retrieve Order Record(s). Please try again.')
                }
                setErrorMessage('')
                csvLink.current.link.click()
            })
            .catch((err) => {
                setErrorMessage('Unable to get Order Record(s).')
                console.log(err)
            })
        }
    }
    if(isComplete){
        return(
            <div style={{position: 'absolute', width: '80vw', paddingTop: '2%', paddingBottom: '2%', paddingRight: '2%'}}>
                <h1 style={{padding: '3%', fontWeight: 'bolder'}}>SEARCHING RECORDS ON {month} {year}</h1>
                {errorMessage && <Alert color='danger'>{errorMessage}</Alert>}
                <Row>
                    <Col>
                        <form className={classes.root}>
                            <Label>Date</Label>
                            <Input
                                type='date'
                                name='date'
                                id='date'
                                required={true}
                                onChange={handleChangeDate}
                                style={{width: '50%'}}
                            />
                        </form>
                    </Col>
                    <Col>
                        <TextField
                            id='standard-select-currency'
                            select
                            required={true}
                            label='Type of Reports'
                            value={option}
                            style = {{width: '50%'}}
                            variant='standard'
                            onChange={handleChangeOption}
                            error={option === null || option === undefined || option === ''}>
                            {options.map((option) => {
                                return <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            })}
                    </TextField>
                    </Col>
                </Row>
                <div className='buttonGroup'>
                    <Row>
                        <Col>
                            <Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={handleSubmit}>SEARCH</Button>
                        </Col>
                        <Col>
                            <Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={getExcelData}>Export to EXCEL</Button>
                            <CSVLink
                                data={data}
                                filename={date + '-Report.csv'}
                                ref={csvLink}
                                target='_blank'
                                className='hidden'
                            />
                        </Col>
                    </Row>
                </div>
                {(option === 'orderRecords') && <MaterialTable
                    columns={orderColumns}
                    data={orderList}
                    title='ORDER RECORD(S)'
                    options={{
                        actionsColumnIndex:-1, addRowPosition:'first', pageSize:5, pageSizeOptions:[5, 7, 10, 15]
                    }}
                />}
                {(option === 'refundRecords') && <MaterialTable
                    columns={refundColumns}
                    data={refundList}
                    title='REFUND RECORD(S)'
                    options={{
                        actionsColumnIndex:-1, addRowPosition:'first', pageSize:5, pageSizeOptions:[5, 7, 10, 15]
                    }}
                />}
                {(option === 'restockRecords') && <MaterialTable
                    columns={restockColumns}
                    data={restockList}
                    title='RESTOCK RECORD(S)'
                    options={{
                        actionsColumnIndex:-1, addRowPosition:'first', pageSize:5, pageSizeOptions:[5, 7, 10, 15]
                    }}
                />}
                {(option === 'lostAndDefectionRecords') && <MaterialTable
                    columns={lostAndDefectionColumns}
                    data={lostAndDefectionList}
                    title='LOST/DEFECTION RECORD(S)'
                    options={{
                        actionsColumnIndex:-1, addRowPosition:'first', pageSize:5, pageSizeOptions:[5, 7, 10, 15]
                    }}
                />}
            </div>
        )
    }
    else{
        return(
            <div></div>
        )
    }
}
