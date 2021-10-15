import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'

export default function PrivateRoute({ component: Component, ...rest}) {
    var currentUser = useAuth()
    return (
        <Route {...rest} render={props => {
            return currentUser.currentUser ? <Component {...props} /> : <Redirect to='/'></Redirect>
        }}>
        </Route>
    )
}
