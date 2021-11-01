import React, { useEffect, useState } from 'react';
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
    const [locationList, setLocationList] = useState([])
    const [isComplete, setIsComplete] = useState(false)
    const [location, setLocation] = useState('South Philly')
    const { logIn, initUserInfo } = useAuth()
    const history = useHistory()
    
    useEffect(() => {
        setIsComplete(false)
        getLocationList()
    }, [])  // eslint-disable-line react-hooks/exhaustive-deps

    async function getLocationList(){
        try{
            db.collection('Configuration').doc('Configuration')
            .get()
            .then((querySnapShot) => {
                var locationList = querySnapShot.data().location
                var newLocationList = []
                locationList.forEach((item) => {
                    var temp = {}
                    temp.value = item
                    temp.label = item
                    newLocationList.push(temp)
                })
                setLocationList(newLocationList)
                setIsComplete(true)
                setErrorMessage('')
            })
        }
        catch{
            setErrorMessage('Unable to get the location list. Please try again later.')
        }
    }

    async function ButtonHandler(e){
        e.preventDefault() 
        try {
            if(location === null || location === undefined || location === ''){
                setErrorMessage('Please select a location and try again.')
            }
            else if(username.length !== 0 && password.length !== 0){
                await logIn(username, password)
                const docRef = doc(db, "Users", username);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().type === 'admin'){
                    var userObj = docSnap.data()
                    userObj.location = location
                    initUserInfo(userObj)
                    history.push('/home')
                }
                else if (docSnap.exists() && docSnap.data().location === location) {
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
    if(isComplete){
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
                        {locationList.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                    </TextField>
                    <br/><Button style={{backgroundColor:'#FFFFFF', color:'#19181A'}} variant='outlined' onClick={ButtonHandler}>SIGN IN</Button>
                </Form>
            </div>
        </div>
    );
}
else{
    return(
        <div></div>
    )
}
}