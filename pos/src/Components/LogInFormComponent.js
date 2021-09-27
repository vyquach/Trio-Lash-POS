import React, { useState } from 'react';
import {Form, FormGroup, Label, Input, Alert, Media} from 'reactstrap'
import image from '../images/Trio-Lash-Logo.png'
import '../styling/style.css';
import {useAuth} from '../Context/AuthContext'
import { useHistory } from 'react-router-dom';
import { Button } from '@material-ui/core'

export default function LogInFormComponent() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { logIn } = useAuth()
    const history = useHistory()
    
    async function ButtonHandler(e){
        e.preventDefault()
        try {
            if(username.length !== 0 && password.length !== 0){
                await logIn(username, password)
                history.push("/home")
            }
            else{
                setErrorMessage('Please provide username and password.')
            }
        } catch {
            setErrorMessage('Username and password you entered is incorrect. Please try again.')
        }
    }

    function handleUsernameChange(event){
        setUsername(event.target.value);
    }

    function handlePasswordChange(event){
        setPassword(event.target.value);
    }
    return (
        <div>
            <div className='form'>
                <Media className='image' object src={image} alt='Trio-Lash-Logo'></Media>
                {errorMessage && <Alert color='danger'>{errorMessage}</Alert>}                        
                <Form>
                    <FormGroup className='text1'>
                        <Label className='padding5'>Username</Label>
                        <Input value={username} type='email' onChange={handleUsernameChange}></Input>
                    </FormGroup>
                    <FormGroup className='text1'>
                        <Label className='padding5'>Password</Label>
                        <Input value={password} type='password' onChange={handlePasswordChange}></Input>
                    </FormGroup>
                    <br/><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={ButtonHandler}>SIGN IN</Button>
                </Form>
            </div>
        </div>
    );
}
