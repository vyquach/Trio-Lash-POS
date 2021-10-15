import React, { useState } from 'react';
import {Form, FormGroup, Label, Input, Alert, Media} from 'reactstrap'
import image from '../images/Trio-Lash-Logo.png'
import '../styling/style.css';
import {useAuth} from '../Context/AuthContext'
import { useHistory } from 'react-router-dom';
import { Button, TextField, MenuItem } from '@material-ui/core'
import { db } from '../firebase'
import { doc, getDoc } from "firebase/firestore";

export default function LogInFormComponent() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [location, setLocation] = useState('South Philly')
    const { logIn, initUserInfo } = useAuth()
    const history = useHistory()
    
    async function ButtonHandler(e){
        e.preventDefault() 
        try {
            if(username.length !== 0 && password.length !== 0){
                await logIn(username, password)
                const docRef = doc(db, "Users", username);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().location === location) {
                    initUserInfo(docSnap.data())
                    history.push('/home')
                } 
                else {
                  setErrorMessage('The username is not associated with this location. Please try again.')
                }
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

    function handleLocation(event){
        setLocation(event.target.value)
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
                    <TextField
                        id='standard-select-currency'
                        select
                        label=''
                        value={location}
                        style = {{width: '80%', paddingTop: '10%', paddingBottom: '10%'}}
                        variant='standard'
                        onChange={handleLocation}>
                        <MenuItem key='South Philly' value='South Philly'>South Philly</MenuItem>
                        <MenuItem key='Newtown' value='Newtown'>Newtown</MenuItem>
                    </TextField>
                    <br/><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={ButtonHandler}>SIGN IN</Button>
                </Form>
            </div>
        </div>
    );
}
