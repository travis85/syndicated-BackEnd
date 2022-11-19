const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 8000 
const { collection, getDocs, query, where, addDoc, setDoc, doc, updateDoc, arrayUnion} = require("firebase/firestore"); 
const firebase = require("firebase/storage") 
const {storage, firestore} = require('./firebase');
const { uploadBytes } = require('firebase/storage');
const multer = require('multer');

app.use(express.json());
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/uploadPartnerToFirestore', async (req, res) => {
    await setDoc(doc(firestore, "partners", req.body.partnerId), req.body);
})

app.get('/apparalPartners', async (req, res ) => {
    const querySnapshot = await getDocs(collection(firestore, "partners"));

    querySnapshot.forEach(async (document) => {
        const partnerPhoto = await firebase.getDownloadURL(firebase.ref(storage, document.data().companyLogo))
        const companyLogoStorageUrl = doc(firestore, "partners", document.data().partnerId);
        await updateDoc(companyLogoStorageUrl, {
            companyLogoStorageUrl: partnerPhoto
        })
        res.json([
            document.data()
        ])
    });
})

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

app.post('/uploadPhotoLogo', multer().single('file'), (req, res) => {
    const photoRef = `${req.file.originalname}`
    const storageRef = firebase.ref(storage, photoRef);
    const metadata = {
        contentType: 'image/jpeg'
    };
    const uploadTask = uploadBytes(storageRef, req.file.buffer, metadata)
    .then(async (snapshot) => {
        const logoPhotoUrl = await firebase.getDownloadURL(firebase.ref(storage, storageRef))
        console.log('Uploaded a blob or file!', logoPhotoUrl);
        res.send(logoPhotoUrl)
    });
})

app.post('/uploadPhotoProduct', multer().single('file'), async (req, res) => {
    const photoRef = `${req.file.originalname}`
    const storageRef = firebase.ref(storage, photoRef);
    const metadata = {
        contentType: 'image/jpeg'
    };
    const uploadTask = await uploadBytes(storageRef, req.file.buffer, metadata)
    .then(async(snapshot) => {
        const productPhotoUrl = await firebase.getDownloadURL(firebase.ref(storage, storageRef))
        console.log('Uploaded a blob or file!', productPhotoUrl);
        res.send(productPhotoUrl)
    })

})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

