import React, {useState, useRef, useEffect} from 'react'
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
    const [totalPayment, setTotalPayment] = useState({})
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
    const [refundColumns, setRefundColumn] = useState([
        {title: 'Order #', field: 'orderNum'},
        {title: 'Date', field: 'date'},
        {title: 'Refund Amount', field: 'refundAmount'}
    ])
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
    useEffect(() => {
        getPaymentMethodList()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
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
    const getPaymentMethodList = () => {
        setIsComplete(false)
        db.collection('Configuration').doc('Configuration')
        .get()
        .then((querySnapshot) => {
            var temp = querySnapshot.data().paymentMethod
            temp.forEach((item) => {
                var newColumn = {}
                newColumn.title = item
                newColumn.field = item
                refundColumns.push(newColumn)
            })
        })
        setIsComplete(true)
    }
    const handleChangeOption = (event) => {
        setOption(event.target.value)
        if(event.target.value === 'refundRecords'){

        }
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
                    var totalAmount = 0
                    querySnapshot.docs.forEach((item) => {
                        var column = {}
                        var obj = item.data()
                        Object.keys(obj).forEach((each) => {
                            if(each !== 'refundAmount'){
                                column[each] = obj[each]
                            }
                            else{
                                Object.keys(obj[each]).forEach((paymentMethod) => {
                                    column[paymentMethod] = obj[each][paymentMethod]
                                    totalAmount += Number(obj[each][paymentMethod])
                                })
                            }
                        })
                        column['refundAmount'] = totalAmount
                        temp.push(column)
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
        
    }
    const getExcelData = async () => {
        if(date === null || date === undefined || date.length === 0 || option === null || option === undefined || option.length === 0){
            setErrorMessage('Please provide valid Date and Type of Reports.')
        }
        else if(option === 'orderRecords'){
            await db.collection(userInfo.location).doc('Orders').collection(date)
            .get()
            .then((querySnapshot) => {
                var excelData = []
                var temp = {}
                var index = 1
                var revenue = 0
                var total = 0
                var tax = 0
                var commission = 0
                var coupon = 0
                var shippingCost = 0 
                var buffer = totalPayment
                if(querySnapshot.docs !== undefined && querySnapshot.docs !== null){
                    querySnapshot.docs.forEach((item) => {
                        temp['#'] = index
                        temp['Order #'] = item.data().orderNum
                        var dateArr = item.data().date.split('-')
                        temp['Date'] =  dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0]
                        temp['Status'] = item.data().status 
                        temp['Shipping Method'] = item.data().shippingMethod
                        temp['Shipping Cost'] = item.data().shippingCost
                        shippingCost += item.data().shippingCost
                        temp['Coupon'] = -item.data().coupon
                        coupon += -item.data().coupon
                        temp['Commission'] = item.data().commission
                        commission += item.data().commission
                        Object.keys(item.data().paymentMethod).forEach((each) => {
                            temp[each] = item.data().paymentMethod[each]
                            if (each in buffer){
                                buffer[each] += item.data().paymentMethod[each]
                            }
                            else{
                                buffer[each] = item.data().paymentMethod[each]
                            }
                        })
                        temp['Tax'] = item.data().tax
                        tax += item.data().tax
                        temp['Total'] = item.data().total
                        total += item.data().total
                        temp['Revenue'] = item.data().subtotal
                        revenue += item.data().subtotal
                        excelData.push(temp)
                        temp = {}
                        index += 1
                    })
                    temp = {}
                    temp['#'] = 'TOTAL'
                    temp['Shipping Cost'] = shippingCost
                    temp['Coupon'] = coupon
                    temp['Commission'] = commission
                    temp['Tax'] = tax
                    temp['Total'] = total
                    temp['Revenue'] = revenue
                    Object.keys(buffer).forEach((each) => {
                        temp[each] = buffer[each]
                    })
                    excelData.push(temp)
                    setData(excelData)
                    setTotalPayment(buffer)
                }
                else{
                    setErrorMessage('Cannot retrieve Refund Record(s). Please try again.')
                }
                setErrorMessage('')
                csvLink.current.link.click()
            })
            .catch((err) => {
                setErrorMessage('Unable to get Refund Record(s).')
                console.log(err)
            })
        }
        else if('refundRecords'){
            await db.collection(userInfo.location).doc('RefundHistory').collection(date)
            .get()
            .then((querySnapshot) => {
                var excelData = []
                var temp = {}
                var total = {}
                var index = 1
                if(querySnapshot.docs !== undefined && querySnapshot.docs !== null){
                    querySnapshot.docs.forEach((item) => {
                        temp['#'] = index
                        var dateArr = item.data().date.split('-')
                        temp['Date'] =  dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0]
                        temp['Order #'] = item.data().orderNum
                        var buffer = {}
                        Object.keys(item.data().refundAmount).forEach((each) => {
                            console.log(item.data().refundAmount[each])
                            buffer[each] = item.data().refundAmount[each]
                            temp[each] = item.data().refundAmount[each]
                            total[each] = item.data().refundAmount[each]
                        })
                        excelData.push(temp)
                        temp = {} 
                        index++
                    })
                    temp['#'] = 'TOTAL'
                    Object.keys(total).forEach((each) => {
                        temp[each] = total[each]
                    })
                    excelData.push(temp)
                    setData(excelData)
                }
                else{
                    setErrorMessage('Cannot retrieve Restock History. Please try again.')
                }
                setErrorMessage('')
                csvLink.current.link.click()
            })
            .catch((err) => {
                setErrorMessage('Unable to get Restock History.')
                console.log(err)
            })
        }
        else if('restockRecords'){
            await db.collection(userInfo.location).doc('RestockHistory').collection(date)
            .get()
            .then((querySnapshot) => {
                var excelData = []
                var temp = {}
                var index = 1
                if(querySnapshot.docs !== undefined && querySnapshot.docs !== null){
                    querySnapshot.docs.forEach((item) => {
                        temp['#'] = index
                        var dateArr = item.data().date.split('-')
                        temp['Date'] =  dateArr[2] + '.' + dateArr[1] + '.' + dateArr[0]
                        temp['Code'] = item.data().code
                        temp['Name'] = item.data().name
                        temp['Description'] = item.data().description
                        temp['Ventor'] = item.data().ventor
                        temp['Price'] = item.data().price
                        temp['Restock Qty'] = item.data().restock
                        temp['Restock WSP'] = item.data().restockWSP
                        excelData.push(temp)
                    })
                    setData(excelData)
                }
                else{
                    setErrorMessage('Cannot retrieve Restock History. Please try again.')
                }
                setErrorMessage('')
                csvLink.current.link.click()
            })
            .catch((err) => {
                setErrorMessage('Unable to get Restock History.')
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
                                filename={date + '-' + userInfo.location + '-' +  option + '.csv'}
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
