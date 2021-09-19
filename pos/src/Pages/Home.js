import React, { useState} from 'react'
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import StorefrontOutlinedIcon from '@material-ui/icons/StorefrontOutlined';
import LocalGroceryStoreOutlinedIcon from '@material-ui/icons/LocalGroceryStoreOutlined';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import InsertChartOutlinedTwoToneIcon from '@material-ui/icons/InsertChartOutlinedTwoTone';
import {useAuth} from '../Context/AuthContext'
import { useHistory } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import ViewInventoryComponent from '../Components/ViewInventoryComponent';
import UpdateInventoryComponent from '../Components/UpdateInventoryComponent';

export default function Home() {

    const { logOut } = useAuth()
    const { history } = useHistory()
    const [dashBoard, setDashboard] = useState(true)
    const [viewInventory, setViewInventory] = useState(false)
    const [updateInventory, setUpdateInventory] = useState(false)
    const [checkout, setCheckout] = useState(false)


    document.title = "Home | Trio Lashes"
    
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
        setViewInventory(false)
        setUpdateInventory(false)
        setCheckout(false)
    }
    function handleViewInventory(){
        setDashboard(false)
        setViewInventory(true)
        setUpdateInventory(false)
        setCheckout(false)
    }
    function handleUpdateInventory(){
        setDashboard(false)
        setViewInventory(false)
        setUpdateInventory(true)
        setCheckout(false)
    }
    function handleCheckout(){
        setDashboard(false)
        setViewInventory(false)
        setUpdateInventory(false)
        setCheckout(true)
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
            <Col className='contentArea'>
                <div>
                    {dashBoard && <div>DASHBOARD</div>}
                    {viewInventory && <ViewInventoryComponent/>}
                    {updateInventory && <UpdateInventoryComponent></UpdateInventoryComponent>}
                    {checkout && <div>CHECK OUT</div>}
                </div>
            </Col>
        </Row>
    )
}
