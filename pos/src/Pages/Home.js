import React, { useState} from 'react'
import StorefrontOutlinedIcon from '@material-ui/icons/StorefrontOutlined';
import LocalGroceryStoreOutlinedIcon from '@material-ui/icons/LocalGroceryStoreOutlined';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import InsertChartOutlinedTwoToneIcon from '@material-ui/icons/InsertChartOutlinedTwoTone';
import {useAuth} from '../Context/AuthContext'
import { useHistory } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import AddProductsComponent from '../Components/AddProductsComponent';
import UpdateExistingProducts from '../Components/UpdateExistingProducts';
import CheckoutComponent from '../Components/CheckoutComponent';

export default function Home() {

    const { logOut } = useAuth()
    const { history } = useHistory()
    const [viewInventory, setViewInventory] = useState(true)
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
    function handleViewInventory(){
        setViewInventory(true)
        setUpdateInventory(false)
        setCheckout(false)
    }
    function handleUpdateInventory(){
        setViewInventory(false)
        setUpdateInventory(true)
        setCheckout(false)
    }
    function handleCheckout(){
        setViewInventory(false)
        setUpdateInventory(false)
        setCheckout(true)
    }

    return (
        <Row>
            <Col xs='4'>
                <div className='sidebar'>
                    <ul className='sidebarList'>
                        {viewInventory ? <li id={'viewInventory'} className='row' onClick={handleViewInventory}>
                            <div id='icon'><StorefrontOutlinedIcon/></div>
                            <div id='title'>UPDATE INVENTORY</div>
                        </li> : 
                        <li className='row' onClick={handleViewInventory}>
                            <div id='icon'><StorefrontOutlinedIcon/></div>
                            <div id='title'>UPDATE INVENTORY</div>
                        </li>}
                        {updateInventory ? <li id={'updateInventory'} className='row' onClick={handleUpdateInventory}>
                            <div id='icon'><InsertChartOutlinedTwoToneIcon/></div>
                            <div id='title'>ADD NEW PRODUCT(S)</div>
                        </li> :
                        <li className='row' onClick={handleUpdateInventory}>
                            <div id='icon'><InsertChartOutlinedTwoToneIcon/></div>
                            <div id='title'>ADD NEW PRODUCT(S)</div>
                        </li>}
                        {checkout ? <li id={'checkout'} className='row' onClick={handleCheckout}>
                            <div id='icon'><LocalGroceryStoreOutlinedIcon/></div>
                            <div id='title'>CHECK OUT</div>
                        </li> :
                        <li className='row' onClick={handleCheckout}>
                            <div id='icon'><LocalGroceryStoreOutlinedIcon/></div>
                            <div id='title'>CHECK OUT</div>
                        </li>}
                        <li id={'logout'} className='row' onClick={handleLogOut}>
                            <div id='icon'><ExitToAppOutlinedIcon/></div>
                            <div id='title'>LOGOUT</div>
                        </li>
                    </ul>
                </div>
            </Col>
            <Col xs='8' sm='8' className='contentArea'>
                <div>
                    {viewInventory && <UpdateExistingProducts/>}
                    {updateInventory && <AddProductsComponent/>}
                    {checkout && <div><CheckoutComponent/></div>}
                </div>
            </Col>
        </Row>
    )
}
