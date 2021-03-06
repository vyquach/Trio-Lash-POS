import React, { useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({children}) {
    const [currentUser, setCurrentUser] = useState()
    const [userInfo, setUserInfo] = useState()

    function logIn(username, password) {
        return auth.signInWithEmailAndPassword(username, password)
    }
    function logOut(){
        return auth.signOut()
    }

    function initUserInfo(user) {
        setUserInfo(user)
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
        })
        return unsubscribe
    },[])
    

    const value = {
        currentUser,
        userInfo,
        initUserInfo,
        logIn,
        logOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}