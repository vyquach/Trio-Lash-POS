import React from 'react'
//import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import StorefrontOutlinedIcon from '@material-ui/icons/StorefrontOutlined';

export default function DashboardComponent() {
    return (
        <div>
            <div className='sidebar'>
                <li key='Dashboard'>
                    <div><StorefrontOutlinedIcon></StorefrontOutlinedIcon></div>
                    <div>DASHBOARD</div>
                </li>
            </div>
        </div>

    )
}
