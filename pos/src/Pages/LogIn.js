import React from 'react';
import LogInFormComponent from '../Components/LogInFormComponent';

export default function LogIn() {

    document.title = "Log In | Trio Lashes"

    return (
        <React.Fragment>
            <div className="padding5">
                <LogInFormComponent></LogInFormComponent>
            </div>
        </React.Fragment>
    )
}