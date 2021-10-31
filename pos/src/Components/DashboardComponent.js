import MaterialTable from 'material-table'
import React, {useState, useEffect} from 'react'
import {useAuth} from '../Context/AuthContext'
import { db } from '../firebase'
import { Col, Row } from 'reactstrap'

export default function DashboardComponent() {
    const [isComplete, setIsComplete] = useState(false)
    const [lowQuantityItems, setLowQuantityItems ] = useState([])
    const [monthlySummary, setMonthlySummary] = useState({
        revenue: 0,
        commission: 0,
    })
    const [mostRecentOrder, setMostRecentOrder] = useState({
        orderNum: '',
        date: '',
        subtotal: 0,
        shippingMethod: '',
        paymentMethod: '', 
    })
    const [bestSeller, setBestSeller] = useState([])
    const { userInfo } = useAuth()
    const columns = [
        {title: 'Code', field: 'code', cellStyle: {width: '20%'}},
        {title: 'Name', field: 'name', cellStyle: {width: '45%'}},
        {title: 'Ventor', field: 'ventor', cellStyle: {width: '25%'}},
        {title: 'Quantity', field: 'quantity', cellStyle: {width: '10%'}}
    ]

    useEffect(() => {
        setIsComplete(false)
        getMonthlySummary()
        getLowQuantityItems()
        getBestSeller()
        getMostRecentOrder()
    }, [])  // eslint-disable-line react-hooks/exhaustive-deps
    const getLowQuantityItems = () => {
        var temp = []
        setLowQuantityItems([])
        db.collection(userInfo.location).doc('Inventory').collection('Inventory')
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if(doc.data().quantity <= 5){
                    temp.push(doc.data())
                }
            })
            setLowQuantityItems(temp)
        })
    }
    const getMonthlySummary = () => {
        var date = new Date()
        db.collection(userInfo.location).doc('SalesSummary').collection(String(date.getFullYear())).doc(String(date.getMonth() + 1))
        .get()
        .then((querySnapshot) => {
            if(querySnapshot.data() !== undefined && querySnapshot.data() !== null){
                setMonthlySummary(querySnapshot.data())
            }
        })
    }
    const getBestSeller = () => {
        var date = new Date()
        var sales = {}
        var itemSold = 0
        var bestSeller = []
        db.collection(userInfo.location).doc('Orders').collection(String(date.getMonth() + 1) + String(date.getFullYear()))
        .get()
        .then((querySnapshot) => {
            querySnapshot.docs.forEach((item) => {
                item.data()['items'].forEach((obj) => {
                    const key = obj.description 
                    var temp = {}
                    if(!(key in sales)){
                        temp = {quantity: obj.quantity, revenue: obj.subtotal}
                    }
                    else{
                        temp = {quantity: obj.quantity + sales[key].quantity, revenue: obj.subtotal + sales[key].revenue}
                    }
                    sales[key] = temp
                })
            })
            for(const [key, value] of Object.entries(sales)){
                itemSold += value.quantity
                if(key !== null){}
            }
            for(let i = 0; i < 3; i++){
                let max = 0
                let maxName = ''
                for(const [key, value] of Object.entries(sales)){
                    if(value.quantity >= max){
                        max = value.quantity 
                        maxName = key
                    }
                }
                bestSeller.push([maxName, max])
                delete sales[maxName]
                max = 0
                maxName = ''
            }
            bestSeller.push(itemSold)
            setBestSeller(bestSeller)
            setIsComplete(true)
        })
    }
    const getMostRecentOrder = () => {
        var temp = {
            orderNum: '',
            date: '',
            total: 0,
            shippingMethod: '',
            paymentMethod: '', 
        }
        setIsComplete(false)
        db.collection(userInfo.location).doc('Orders').collection('MostRecentOrder').doc('MostRecentOrder')
        .get()
        .then((querySnapshot) => {
            if(querySnapshot.data() !== undefined && querySnapshot.data() !== null){
                temp.orderNum = querySnapshot.data().orderNum
                temp.date = querySnapshot.data().date
                temp.subtotal = querySnapshot.data().subtotal
                temp.shippingMethod = querySnapshot.data().shippingMethod
                temp.paymentMethod = querySnapshot.data().paymentMethod
                temp.location = querySnapshot.data().location
                setMostRecentOrder(temp)
            }
            setIsComplete(true)
        })
    }

    if(isComplete){
        return (
            <div>
            <Row>
                <Col>
                    <Row>
                         <Col style={{paddingTop: '3%'}}>
                            <div style={{position: 'relative', backgroundColor: '#EDB5BF', padding: '3%'}}>
                            <h4 style={{fontWeight: 'bolder', color: 'white'}}>ITEMS SOLD</h4>
                            <h1 style={{fontWeight: 'bolder', color: 'white', textAlign: 'right', fontSize: '40px'}}>{bestSeller[3]}</h1>
                            </div>
                         </Col>
                         <Col style={{paddingTop: '3%'}}>
                            <div style={{position: 'relative', backgroundColor: '#99CED3', padding: '3%'}}>
                            <h4 style={{fontWeight: 'bolder', color: 'white'}}>COMMISSION</h4>
                            {monthlySummary.commission !== undefined ? <h1 style={{fontWeight: 'bolder', color: 'white', textAlign: 'right', fontSize: '40px'}}>${(Math.round(monthlySummary.commission * 100) / 100).toFixed(2)}</h1> : <h1 style={{fontWeight: 'bolder', color: 'white', textAlign: 'right', fontSize: '40px'}}>$0.00</h1>}
                            </div>
                         </Col>
                         <Row style={{paddingTop: '3%', paddingLeft: '3.5%', paddingRight: '0', width: '48vw'}}>
                            <div style={{position: 'relative', backgroundColor: '#C38D9E', padding: '3%', paddingTop: '3%'}}>
                            <h4 style={{fontWeight: 'bolder', color: 'white'}}>MOST RECENT ORDER</h4>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '15px'}}><span style={{float: 'left'}}>Order Num:</span><span style={{float: 'right'}}>{mostRecentOrder.orderNum}</span><br/></span>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '15px'}}><span style={{float: 'left'}}>Date:</span><span style={{float: 'right'}}>{mostRecentOrder.date}</span><br/></span>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '15px'}}><span style={{float: 'left'}}>Payment Method:</span><span style={{float: 'right'}}>{mostRecentOrder.paymentMethod}</span><br/></span>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '15px'}}><span style={{float: 'left'}}>Shipping Method:</span><span style={{float: 'right'}}>{mostRecentOrder.shippingMethod}</span><br/></span>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '24px'}}><span style={{float: 'left'}}>Subtotal: </span><span style={{float: 'right'}}>${mostRecentOrder.subtotal}</span><br/></span>
                            </div>
                         </Row>
                    </Row>
                     <Row style={{paddingTop: '3%'}}>
                         <Col>
                             <div style={{borderColor: '#5F6366'}}>
                                 <MaterialTable    
                                     columns={columns} 
                                     data={lowQuantityItems} 
                                     title='RESTOCKING'
                                     options={{
                                         actionsColumnIndex:-1, addRowPosition:'first', pageSize:6, pageSizeOptions:[6,8,10,15], color: 'white'
                                     }}
                                     style={{width: '45vw'}}
                                 />
                             </div>
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Row style={{paddingTop: '4.1%'}}>
                        <div style={{ width: '34vw', maxHeight: 'fit-content', backgroundColor: '#86B3D1', padding: '2%'}}>
                            <h2 style={{fontWeight: 'bolder', color: 'white'}}>REVENUE SOURCE(S)</h2><br/>
                            {Object.keys(monthlySummary).map((key) => {
                                if(key !== 'commission' && key !== 'revenue'){
                                    return <span key={key} style={{fontWeight: 'bolder', color: 'white', fontSize: '20px'}}><span style={{float: 'left'}}>{key}</span><span style={{float: 'right'}}>${monthlySummary[key]}</span><br/><br/></span>
                                }
                                return true
                            })}
                            <hr/>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '50px', float: 'left'}}>REVENUE</span>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '50px', float: 'right'}}>${monthlySummary.revenue.toFixed(2)}</span>
                        </div>
                    </Row>
                    <Row style={{paddingTop: '4%'}}>
                        <div style={{position: 'absolute', width: '34vw', maxHeight: 'fit-content', backgroundColor: '#8E8368', padding: '1%'}}>
                            <h2 style={{fontWeight: 'bolder', color: 'white'}}>BEST SELLER(S)</h2><hr/>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '20px'}}><span style={{float: 'left'}}>Name</span><span style={{float: 'right'}}>Units Sold</span><br/><br/></span>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '18px'}}><span style={{float: 'left'}}>{bestSeller[0][0]}</span><span style={{float: 'right'}}>{bestSeller[0][1]} ({((Math.round((((bestSeller[0][1] / bestSeller[3]) + Number.EPSILON) * 100)) / 100) * 100).toFixed(2)}%)</span><br/><br/></span>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '18px'}}><span style={{float: 'left'}}>{bestSeller[1][0]}</span><span style={{float: 'right'}}>{bestSeller[1][1]} ({((Math.round((((bestSeller[1][1] / bestSeller[3]) + Number.EPSILON) * 100)) / 100) * 100).toFixed(2)}%)</span><br/><br/></span>
                            <span style={{fontWeight: 'bolder', color: 'white', fontSize: '18px'}}><span style={{float: 'left'}}>{bestSeller[2][0]}</span><span style={{float: 'right'}}>{bestSeller[2][1]} ({((Math.round((((bestSeller[2][1] / bestSeller[3]) + Number.EPSILON) * 100)) / 100) * 100).toFixed(2)}%)</span><br/><br/></span>
                        </div>
                    </Row>
                </Col>
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
