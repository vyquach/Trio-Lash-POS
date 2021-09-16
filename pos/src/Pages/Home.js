import React, { useState } from 'react'
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import StorefrontOutlinedIcon from '@material-ui/icons/StorefrontOutlined';
import LocalGroceryStoreOutlinedIcon from '@material-ui/icons/LocalGroceryStoreOutlined';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import InsertChartOutlinedTwoToneIcon from '@material-ui/icons/InsertChartOutlinedTwoTone';

export default function Home() {

    const sidebarItems = [
        {
            title: "DASHBOARD",
            icon: <DashboardOutlinedIcon/>,
        },
        {
            title: "VIEW INVENTORY",
            icon: <StorefrontOutlinedIcon/>
        },
        {
            title: "UPDATE INVENTORY",
            icon: <InsertChartOutlinedTwoToneIcon/>
        },
        {
            title: "CHECK OUT",
            icon: <LocalGroceryStoreOutlinedIcon/>
        },
        {
            title: "LOGOUT",
            icon: <ExitToAppOutlinedIcon/>
        },
    ]

    document.title = "Home | Trio Lashes"
    
    return (
        <div className='sidebar'>
            <ul className='sidebarList'>
            {sidebarItems.map((val, key) => {
                return ( 
                <li key={key} className='row'>
                    <div id='icon'>{val.icon}</div>
                    <div id='title'>{val.title}</div>
                </li>
                )
        })}
            </ul>
        </div>
    )
}
