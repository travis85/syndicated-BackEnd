// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app") ;
const { getFirestore} = require("firebase/firestore") ;
const { getStorage } = require("firebase/storage");
const { getAuth, inMemoryPersistence, setPersistence} = require('firebase/auth') ;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbS9LiQLFgO3O2RCZnCx1OySkkRH9IJJw",
  authDomain: "syndicated-d9305.firebaseapp.com",
  projectId: "syndicated-d9305",
  storageBucket: "syndicated-d9305.appspot.com",
  messagingSenderId: "210361917358",
  appId: "1:210361917358:web:aaf9cff7515f07321d323f"
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
