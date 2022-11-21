const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 8000 
const { collection, getDocs, query, where, setDoc, doc} = require("firebase/firestore"); 
const firebase = require("firebase/storage") 
const {storage, firestore} = require('./firebase');
const { uploadBytes } = require('firebase/storage');
const multer = require('multer');
const { auth } = require('./firebase') 
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth') 

app.use(express.json());
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

//CREATES EMAIL AND PASSWORD AUTH
//{RegisterPage Component} 
app.post('/createAuthToFirebase', async (req, res) => {
    const email = req.body.email
    const password = req.body.password//ADD SALT
    const create = await createUserWithEmailAndPassword(auth, email, password) 
    res.send('Auhterization Set!')
})

//ADDS PROFILE TO DATABASE
//{AddProductPage Component} 
app.post('/uploadPartnerToFirestore', async (req, res) => {
    await setDoc(doc(firestore, "partners", req.body.partnerId), req.body);
})

//{signIn component}
app.post('/fetchPartnerProfile', async (req, res) => {
    const partner = await signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    const q = query(collection(firestore, "partners"), where("email", "==", req.body.email));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
        res.json([
            doc.data()
        ])
    });
})


//START OF PARTNERS ROUTES
app.get('/apparalPartners', async (req, res ) => {
    let data = []
    const q = query(collection(firestore, "partners"), where("type", "==", 'Apparel'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
        data.push(doc.data())
    });
    res.json([
        data
    ])
})
app.get('/foodPartners', async (req, res ) => {
    let data = []
    const q = query(collection(firestore, "partners"), where("type", "==", 'Food'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
        data.push(doc.data())
    });
    res.json([
        data
    ])
})
app.get('/miscPartners', async (req, res ) => {
    let data = []
    const q = query(collection(firestore, "partners"), where("type", "==", 'Misc'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
        data.push(doc.data())
    });
    res.json([
        data
    ])
})

//CALLED IN ALL PARTNERS ROUTES
app.post('/selectedPartner', async (req, res) => {
    const id = req.body.id
    const q = query(collection(firestore, "partners"), where("partnerId", "==", id));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
        res.json([
            document.data(),
         ])
    });   
})

//PHOTO UPLOAD TO STORAGE FOR LOGO
//{Admin COMPONENT }
app.post('/uploadPhotoLogo', multer().single('file'), (req, res) => {
    const photoRef = `${req.file.originalname}`
    const storageRef = firebase.ref(storage, photoRef);
    const metadata = {
        contentType: 'image/jpeg'
    };
    const uploadTask = uploadBytes(storageRef, req.file.buffer, metadata)
    .then(async (snapshot) => {
        const logoPhotoUrl = await firebase.getDownloadURL(firebase.ref(storage, storageRef))
        console.log('Uploaded a blob or file!');
        res.send(logoPhotoUrl)
    });
})

//PHOTO UPLOAD TO STORAGE FOR PRODUCTS
//{addProuductModal COMPONENT}
app.post('/uploadPhotoProduct', multer().single('file'), async (req, res) => {
    const photoRef = `${req.file.originalname}`
    const storageRef = firebase.ref(storage, photoRef);
    const metadata = {
        contentType: 'image/jpeg'
    };
    const uploadTask = await uploadBytes(storageRef, req.file.buffer, metadata)
    .then(async(snapshot) => {
        const productPhotoUrl = await firebase.getDownloadURL(firebase.ref(storage, storageRef))
        console.log('Uploaded a blob or file!');
        res.send(productPhotoUrl)
    })

})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

