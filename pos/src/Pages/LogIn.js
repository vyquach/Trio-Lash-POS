import React, { Component } from 'react';
import LogInFormComponent from '../Components/LogInFormComponent';

export class LogIn extends Component {

    constructor(props){
        super(props)
        this.state = {

        }
        this.logIn_Redirect = this.logIn_Redirect.bind(this);
        document.title = "Log In | Trio Lashes"
    }

    logIn_Redirect(userName, password){
        console.log(this.state.userName)
    }

    render() {
        return (
            <React.Fragment>
                <div className="padding5">
                    <LogInFormComponent userName={this.state.userName} password={this.state.password} logIn_Redirect={this.logIn_Redirect}></LogInFormComponent>
                </div>
            </React.Fragment>
        );
    }
}

export default LogIn