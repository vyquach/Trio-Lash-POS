import './App.css';
import React from 'react'
import {BrowserRouter, Route} from 'react-router-dom'
import LogInPage from './Pages/LogIn.js'
import Home from './Pages/Home.js'
import { AuthProvider} from './Context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <div className='App'>
        <Route path={['/']} exact render={() => {
          return(
            <LogInPage></LogInPage>
          )
        }}/>
      </div>
      <div className='App'>
        <Route path={['/home']} exact render={() => {
          return(
            <Home></Home>
          )
        }}/>
      </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
