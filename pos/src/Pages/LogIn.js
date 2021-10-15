import React from 'react';
import LogInFormComponent from '../Components/LogInFormComponent';
import { useAuth } from '../Context/AuthContext'

export default function LogIn() {
    const currentUser = useAuth()
    const { logOut } = useAuth()
    document.title = "Log In | Trio Lash"
    
    if(currentUser.currentUser === null || currentUser.currentUser === undefined){
        logOut()
    }

    return (
        <React.Fragment>
            <div className="padding5">
                <LogInFormComponent></LogInFormComponent>
            </div>
        </React.Fragment>
    )
}