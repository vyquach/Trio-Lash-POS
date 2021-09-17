import './App.css';
import React from 'react'
import {BrowserRouter, Route} from 'react-router-dom'
import LogInPage from './Pages/LogIn.js'
import Home from './Pages/Home.js'
import { AuthProvider} from './Context/AuthContext'
import PrivateRoute from './Components/PrivateRoute';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <div className='App'>
        <Route exact path={['/']} component={LogInPage}></Route>
      </div>
      <div className='App'>
        <PrivateRoute exact path={['/home']} component={Home}></PrivateRoute>
      </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
