const { initializeApp } = require("firebase/app") ;
const { getFirestore} = require("firebase/firestore") ;
const { getStorage } = require("firebase/storage");
const { getAuth, inMemoryPersistence, setPersistence} = require('firebase/auth') ;
require('dotenv').config({path:'.env'});

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage()
const auth = getAuth(app);
(async () => {
  await setPersistence(auth, inMemoryPersistence);
})();

module.exports = {
  firestore,
  storage,
  auth
}


