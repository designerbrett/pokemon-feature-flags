// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyByeY2xsTIp9elKp3pG6Hdta0fc0w63sPY",
  authDomain: "savings-forecast-dc11a.firebaseapp.com",
  databaseURL: "https://savings-forecast-dc11a-default-rtdb.firebaseio.com",
  projectId: "savings-forecast-dc11a",
  storageBucket: "savings-forecast-dc11a.appspot.com",
  messagingSenderId: "332607005950",
  appId: "1:332607005950:web:0285fa652d93647a74f1af",
  measurementId: "G-7G8F1QSDBM"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export { auth };

// Set up onAuthStateChanged listener
export const onAuthStateChange = (callback) => {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};