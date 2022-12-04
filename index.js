const bodyParser = require('body-parser')
const express = require('express')
const path = require('path')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 8000 
const { collection, getDocs, query, where, setDoc, doc, updateDoc, arrayRemove, arrayUnion, onSnapshot } = require("firebase/firestore"); 
const firebase = require("firebase/storage") 
const {storage, firestore} = require('./firebase');
const { uploadBytes, ref, deleteObject } = require('firebase/storage');
const multer = require('multer');
const { auth } = require('./firebase') 
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth') 
const { v4  }  = require('uuid');
 

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

// {PartnerprofilePage}
app.post('/deleteProduct', async (req, res) => {
    const photoToDeleteRef = ref(storage, req.body.product.productPhoto);
    deleteObject(photoToDeleteRef)
    const partnerRef = doc(firestore, 'partners', req.body.partnerId);
    const productToDelete = req.body.product
    console.log(productToDelete, 'delete')
    let data
    await updateDoc(partnerRef, {
        products: arrayRemove(productToDelete)
    })
    const snapShot = onSnapshot(partnerRef, async (doc) => {
        console.log(doc.data())
        data = doc.data()
    })
    res.json(snapShot)
})
// {PartnerprofilePage}
app.post('/addProduct', async (req, res) => {
    const partnerRef = doc(firestore, 'partners', req.body.partnerId);
    const productToAdd = {
        productId: v4(),
        productPhoto: req.body.productPhoto,
        productPhotoUrl: req.body.productPhotoUrl,
        productPrice: req.body.productPrice,
        productName: req.body.productName,
        description: req.body.description
    }
    console.log(productToAdd)
    let data
    await updateDoc(partnerRef, {
        products: arrayUnion(productToAdd)
    })
    const snapShot = onSnapshot(partnerRef, (doc) => {
        data = doc.data()
    })
    res.json(data)
})

//{SignIn component}
app.post('/fetchPartnerProfile', async (req, res) => {
    
    await signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then(async (userCredential) => {
        const user = userCredential.user
        const q = query(collection(firestore, "partners"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        let quriedUser = []
        querySnapshot.forEach(async (doc) => {
            quriedUser = doc.data()
        });
        res.json([
            quriedUser
        ])
    })
        .catch((error) => {  
        res.send(error.code)
    } )
})

//{PartnerProfilePage Component}
app.post('/updatePartnerProfile', async (req, res) => {
    const partnerId = req.body.partnerId
    const partnerRef = doc(firestore, "partners", partnerId);
    const hasReview = Object.hasOwn(req.body, 'comment')
    if (hasReview) {
        const data = {
            name: req.body.name,
            comment: req.body.comment,
            rating: req.body.rating
        }
        await updateDoc(partnerRef, {
            reviews: arrayUnion(data),
        });
        const snapShot = onSnapshot(partnerRef, (doc) => {
            return doc.data()
        })
        res.json(snapShot)
    } else {
        const data = req.body
        console.log(data,'/updatePartnerProfile')
        await updateDoc(partnerRef, data);
        const snapShot = onSnapshot(partnerRef, (doc) => {
            res.json(doc.data())
        })
    }
    
})
//GET ALL PARTNERS
//{HEADER COMPONENT}
app.get('/getAllPartners', async (req, res) => {
    let data = []
    const partnersRef = query(collection(firestore, "partners"))
    const snapShot = await getDocs(partnersRef)
    snapShot.forEach(doc => {
        data.push(doc.data())
        console.log(doc.id, '=>', doc.data());
    });
    res.json(data)
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
    console.log(req.body)
    const id = req.body.id
    console.log(id, 'kjbvjkbasv;abvs')
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
app.post('/uploadPhotoLogo', multer().single('file'), async (req, res) => {
    const photoRef = `${req.file.originalname}`
    const storageRef = firebase.ref(storage, photoRef);
    const metadata = {
        contentType: 'image/jpeg'
    };
    const uploadTask = await uploadBytes(storageRef, req.file.buffer, metadata)
    console.log(uploadTask)
    const logoPhotoUrl = await firebase.getDownloadURL(firebase.ref(storage, storageRef))
    console.log('Uploaded a blob or file!');
    res.send(logoPhotoUrl)
})

app.post('/updatePhoto', multer().single('file'), async(req, res) => {
    const photoToDeleteRef = ref(storage, req.body.photoToDelete);
    deleteObject(photoToDeleteRef)
    .then(() => {
        console.log('Photo Deleted')
    }).catch((error) => {
    // Uh-oh, an error occurred!
        console.log(error)
    });  
    const photoRef = req.file.originalname
    const storageRef = firebase.ref(storage, photoRef); 
    const metadata = {
        contentType: 'image/jpeg'
    };
    const uploadTask = await uploadBytes(storageRef, req.file.buffer, metadata)
    const logoPhotoUrl = await firebase.getDownloadURL(firebase.ref(storage, storageRef))
    console.log('Uploaded a blob or file!', logoPhotoUrl);
    res.send(logoPhotoUrl)
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
    const productPhotoUrl = await firebase.getDownloadURL(firebase.ref(storage, storageRef))
    console.log('Uploaded a blob or file!');
    res.send(productPhotoUrl)
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

