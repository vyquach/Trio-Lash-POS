import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const app = firebase.initializeApp({
    /*apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID*/
    apiKey: "AIzaSyAczOT2eZ04durD4uWMbFgDTfcha5dcxic",
  authDomain: "trio-lashes.firebaseapp.com",
  projectId: "trio-lashes",
  storageBucket: "trio-lashes.appspot.com",
  messagingSenderId: "816030048918",
  appId: "1:816030048918:web:cf165b0405d507b5bf98b7"
})

export const auth = app.auth()
export default app
