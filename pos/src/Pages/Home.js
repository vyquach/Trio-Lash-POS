import React, { useState} from 'react'
import StorefrontOutlinedIcon from '@material-ui/icons/StorefrontOutlined';
import LocalGroceryStoreOutlinedIcon from '@material-ui/icons/LocalGroceryStoreOutlined';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import {useAuth} from '../Context/AuthContext'
import { useHistory } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import UpdateInventory from '../Components/UpdateInventory'
import CheckoutComponent from '../Components/CheckoutComponent';

export default function Home() {

    const { logOut } = useAuth()
    const { history } = useHistory()
    const [updateInventory, setUpdateInventory] = useState(true)
    const [checkout, setCheckout] = useState(false)


    document.title = "Home | Trio Lash"
    
    async function handleLogOut(e){
        e.preventDefault()
        try {
            await logOut()
            history.push('/')
        } catch {
        }
    }
    function handleUpdateInventory(){
        setUpdateInventory(true)
        setCheckout(false)
    }
    function handleCheckout(){
        setUpdateInventory(false)
        setCheckout(true)
    }

    return (
        <Row>
            <Col xs='4' sm='4'>
                <div className='sidebar'>
                    <ul className='sidebarList'>
                        {updateInventory ? <li id={'updateInventory'} className='row' onClick={handleUpdateInventory}>
                            <div id='icon'><StorefrontOutlinedIcon/></div>
                            <div id='title'>UPDATE INVENTORY</div>
                        </li> : 
                        <li className='row' onClick={handleUpdateInventory}>
                            <div id='icon'><StorefrontOutlinedIcon/></div>
                            <div id='title'>UPDATE INVENTORY</div>
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
            <Col xs='auto' sm='auto' className='contentArea'>
                <div>
                    {updateInventory && <UpdateInventory/>}
                    {checkout && <div><CheckoutComponent/></div>}
                </div>
            </Col>
        </Row>
    )
}
