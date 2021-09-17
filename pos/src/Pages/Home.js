import React, { useState, useEffect } from 'react'
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import StorefrontOutlinedIcon from '@material-ui/icons/StorefrontOutlined';
import LocalGroceryStoreOutlinedIcon from '@material-ui/icons/LocalGroceryStoreOutlined';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import InsertChartOutlinedTwoToneIcon from '@material-ui/icons/InsertChartOutlinedTwoTone';
import {useAuth} from '../Context/AuthContext'
import { useHistory } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';
import ViewInventoryComponent from '../Components/ViewInventoryComponent';
import { db } from '../firebase'

export default function Home() {

    const { logOut } = useAuth()
    const { history } = useHistory()
    const [products, setProducts] = useState([])

    document.title = "Home | Trio Lashes"

    useEffect(() => {
        db.collection('Inventory').where('name', '!=', null)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            setProducts(products =>[...products, doc.data()])
            })
        })
    }, [])
    
    async function handleLogOut(e){
        e.preventDefault()
        try {
            await logOut()
            history.push('/')
        } catch {
        }
    }
    function handleDashboard(){
        alert('hello')
    }
    function handleViewInventory(){
        alert('xin chao')
    }
    function handleUpdateInventory(){
        alert('ola')
    }
    function handleCheckout(){
        alert('money')
    }

    return (
        <Row>
            <Col xs='4' sm='4'>
                <div className='sidebar'>
                    <ul className='sidebarList'>
                        <li key={'dashboard'} className='row' onClick={handleDashboard}>
                            <div id='icon'><DashboardOutlinedIcon/></div>
                            <div id='title'>DASHBOARD</div>
                        </li>
                        <li key={'viewInventory'} className='row' onClick={handleViewInventory}>
                            <div id='icon'><StorefrontOutlinedIcon/></div>
                            <div id='title'>VIEW INVENTORY</div>
                        </li>
                        <li key={'updateInventory'} className='row' onClick={handleUpdateInventory}>
                            <div id='icon'><InsertChartOutlinedTwoToneIcon/></div>
                            <div id='title'>UPDATE INVENTORY</div>
                        </li>
                        <li key={'checkout'} className='row' onClick={handleCheckout}>
                            <div id='icon'><LocalGroceryStoreOutlinedIcon/></div>
                            <div id='title'>CHECK OUT</div>
                        </li>
                        <li key={'logout'} className='row' onClick={handleLogOut}>
                            <div id='icon'><ExitToAppOutlinedIcon/></div>
                            <div id='title'>LOGOUT</div>
                        </li>
                    </ul>
                </div>
            </Col>
            <Col xs='auto' fluid='sm'>
                <div className='contentArea'>
                    <ViewInventoryComponent products={products}/>
                </div>
            </Col>
        </Row>
    )
}
