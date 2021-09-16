import React, { useState } from 'react';
import {Row, Col, Media, Form, FormGroup, Label, Input, Button, Alert} from 'reactstrap'
import image from '../images/LogIn_Image.jpg'
import '../styling/style.css';
import {useAuth} from '../Context/AuthContext'
import { useHistory } from 'react-router-dom';

export default function LogInFormComponent() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { logIn } = useAuth()
    const history = useHistory()
    
    async function ButtonHandler(e){
        e.preventDefault()
        try {
             await logIn(username, password)
             history.push("/home")
        } catch {
            setErrorMessage('Invalid username or password. Please try again.')
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
            <Row>
                <Col xs='6'>
                    <div className='form'>
                        <Label className='paragraph1'>Welcome to Trio Lashes</Label>    
                        {errorMessage && <Alert color='danger'>{errorMessage}</Alert>}                        
                        <Form>
                            <FormGroup className='text1'>
                                <Label>Username</Label>
                                <Input className='w-75' value={username} type='email' onChange={handleUsernameChange}></Input>
                            </FormGroup>
                            <FormGroup className='text1'>
                                <Label>Password</Label>
                                <Input className='w-75' value={password} type='password' onChange={handlePasswordChange}></Input>
                            </FormGroup>
                        </Form>
                    </div>
                    <div>
                        <br></br><Button color='primary' onClick={ButtonHandler}>Sign In</Button>
                    </div>
                    </Col>
                <Col xs='6'>
                    <Media className='image' object src={image} alt='affordable lash supplies 1'></Media>
                </Col>
            </Row>
        </div>
    );
}
