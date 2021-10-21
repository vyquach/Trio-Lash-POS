import React, { useState} from 'react'
import StorefrontOutlinedIcon from '@material-ui/icons/StorefrontOutlined';
import LocalGroceryStoreOutlinedIcon from '@material-ui/icons/LocalGroceryStoreOutlined';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import CompareArrowsOutlinedIcon from '@material-ui/icons/CompareArrowsOutlined';
import {useAuth} from '../Context/AuthContext'
import { useHistory } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import UpdateInventory from '../Components/UpdateInventory'
import CheckoutComponent from '../Components/CheckoutComponent';
import DashboardComponent from '../Components/DashBoardComponent'
import RefundComponent from '../Components/RefundComponent';

export default function Home() {

    const { logOut, userInfo } = useAuth()
    const { history } = useHistory()
    const [dashboard, setDashboard] = useState(false)
    const [updateInventory, setUpdateInventory] = useState(false)
    const [checkout, setCheckout] = useState(true)
    const [refund, setRefund] = useState(false)

    document.title = "Home | Trio Lash"

    async function handleLogOut(e){
        e.preventDefault()
        try {
            await logOut()
            history.push('/')
        } catch {
        }
    }
    function handleDashboard(){
        setDashboard(true)
        setUpdateInventory(false)
        setCheckout(false)
        setRefund(false)
    }
    function handleUpdateInventory(){
        setDashboard(false)
        setUpdateInventory(true)
        setCheckout(false)
        setRefund(false)
    }
    function handleCheckout(){
        setDashboard(false)
        setUpdateInventory(false)
        setCheckout(true)
        setRefund(false)
    }
    function handleRefund(){
        setDashboard(false)
        setUpdateInventory(false)
        setCheckout(false)
        setRefund(true)
    }

    if(userInfo.type === 'admin'){
        return (
            <Row>
                <Col xs='4' sm='4'>
                    <div className='sidebar'>
                        <ul className='sidebarList'>
                            <h6 className='greeting'>{userInfo.firstName} | {userInfo.location}</h6>
                            <hr/><br/><br/>
                            {dashboard ? <li id={'dashboard'} className='row' onClick={handleDashboard}>
                                <div id='icon'><DashboardOutlinedIcon/></div>
                                <div id='title'>DASHBOARD</div>
                            </li> :
                            <li className='row' onClick={handleDashboard}>
                                <div id='icon'><DashboardOutlinedIcon/></div>
                                <div id='title'>DASHBOARD</div>
                            </li>}
                            {updateInventory ? <li id={'updateInventory'} className='row' onClick={handleUpdateInventory}>
                                <div id='icon'><StorefrontOutlinedIcon/></div>
                                <div id='title'>INVENTORY</div>
                            </li> : 
                            <li className='row' onClick={handleUpdateInventory}>
                                <div id='icon'><StorefrontOutlinedIcon/></div>
                                <div id='title'>INVENTORY</div>
                            </li>}
                            {checkout ? <li id={'checkout'} className='row' onClick={handleCheckout}>
                                <div id='icon'><LocalGroceryStoreOutlinedIcon/></div>
                                <div id='title'>CHECK OUT</div>
                            </li> :
                            <li className='row' onClick={handleCheckout}>
                                <div id='icon'><LocalGroceryStoreOutlinedIcon/></div>
                                <div id='title'>CHECK OUT</div>
                            </li>}
                            {refund ? <li id={'refund'} className='row' onClick={handleRefund}>
                                <div id='icon'><CompareArrowsOutlinedIcon/></div>
                                <div id='title'>REFUND - LOST/DAMAGE</div>
                            </li> :
                            <li className='row' onClick={handleRefund}>
                                <div id='icon'><CompareArrowsOutlinedIcon/></div>
                                <div id='title'>REFUND - LOST/DAMAGE</div>
                            </li>}
                            <li id={'logout'} className='row' onClick={handleLogOut}>
                                <div id='icon'><ExitToAppOutlinedIcon/></div>
                                <div id='title'>LOGOUT</div>
                            </li>
                        </ul>
                    </div>
                </Col>
                <Col xs='auto' sm='auto' className='contentArea'>
                    <div>
                        {updateInventory && <UpdateInventory/>}
                        {checkout && <CheckoutComponent/>}
                        {dashboard && <DashboardComponent/>}
                        {refund && <RefundComponent/>}
                    </div>
                </Col>
            </Row>
        )
    }
    else{
        return(
            <Row>
                <Col xs='4' sm='4'>
                    <div className='sidebar'>
                        <ul className='sidebarList'>
                            <h6 className='greeting'>{userInfo.firstName} | {userInfo.location}</h6>
                            <hr/><br/><br/>
                            {checkout ? <li id={'checkout'} className='row' onClick={handleCheckout}>
                                <div id='icon'><LocalGroceryStoreOutlinedIcon/></div>
                                <div id='title'>CHECK OUT</div>
                            </li> :
                            <li className='row' onClick={handleCheckout}>
                                <div id='icon'><LocalGroceryStoreOutlinedIcon/></div>
                                <div id='title'>CHECK OUT</div>
                            </li>}
                            {refund ? <li id={'refund'} className='row' onClick={handleRefund}>
                                <div id='icon'><CompareArrowsOutlinedIcon/></div>
                                <div id='title'>REFUND - LOST/DAMAGE</div>
                            </li> :
                            <li className='row' onClick={handleRefund}>
                                <div id='icon'><CompareArrowsOutlinedIcon/></div>
                                <div id='title'>REFUND - LOST/DAMAGE</div>
                            </li>}
                            <li id={'logout'} className='row' onClick={handleLogOut}>
                                <div id='icon'><ExitToAppOutlinedIcon/></div>
                                <div id='title'>LOGOUT</div>
                            </li>
                        </ul>
                    </div>
                </Col>
                <Col xs='auto' sm='auto' className='contentArea'>
                    <div>
                        {checkout && <CheckoutComponent/>}
                        {refund && <RefundComponent/>}
                    </div>
                </Col>
            </Row>
        )
    }
}
