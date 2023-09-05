// Require firebase and firebase storage
const firebase = require('firebase');
const config = require('./../configFireBase');

// Initialize our firebase app
const db = firebase.initializeApp(config.firebaseConfig);

// If using firestore
// const firestore = firebase.firestore();

require("firebase/storage");

// create reference to storage
const storage = firebase.storage().ref();

// Add image to storage and return file path
const addImg = async (req, res, next) => {
    try {
        const file = req.file;
        const name = file.originalname.split(".")[0];
        const type = file.originalname.split(".")[1];
        const fileName = `${name}.${type}`;

        // Create reference for file name in cloud storage
        const imgRef = storage.child(fileName);

        // Create file metadata including the content type
        const metadata = {
        contentType: req.file.mimetype
        };

        // Upload the file in the bucket storage
        const uploafFile = await imgRef.put(file.buffer, metadata);

        // Get the public URL
        const getURL = await uploafFile.ref.getDownloadURL();

        console.log("File successfully uploaded");

        req.body.urlData = {
            name: req.file.originalname,
            filetype: req.file.mimetype,
            URL: getURL
        }
        next();
    } catch (err) {
        res.status(401).json({
            status: 401,
            message: 'Something went wrong while file uploading'
        });
    }
};

module.exports = addImg;