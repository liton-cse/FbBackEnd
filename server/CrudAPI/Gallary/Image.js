const express= require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('../../DatabaseConfig/database');
require('dotenv').config();
const createImageModel = require('../../models/gallary/ImageSchema');
const multer = require('multer');
const cookiePerser =require('cookie-parser');
const router = express.Router();
const path = require("path");
router.use(cookiePerser());
const fs = require('fs');

//Connecting to database.. "Slide-Collection"....
const ImageCollection = connectToDatabase('ImageCollection',process.env.MONGODB_URI_GALLARY);
const ImageModel= createImageModel(ImageCollection);
//middleware .......
express().use(bodyParser.json());

// Configure multer storage
const storageEngine = multer.memoryStorage(); 
const upload = multer({ storage: storageEngine,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
        }
 });

       // Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
  }

// Set up a POST route to handle image uploads
router.post('/images', upload.array('images', 100), async (req, res) => {
    const { district, subDistrict } = req.body;

    if (!district || !subDistrict) {
        return res.status(400).send('District and Sub-District names are required');
    }
    const directoryFolder = path.resolve(__dirname,'../../../upload_image');
    try {
        // Convert district and subDistrict to lowercase before storing
        const lowerDistrict = district.toLowerCase();
        const lowerSubDistrict = subDistrict.toLowerCase();

        // Save each image to MongoDB
        const savedImages = await Promise.all(req.files.map(file => {
            const newImage = new ImageModel({
                district: lowerDistrict,
                subDistrict: lowerSubDistrict,
                imageName: file.originalname,
                imagePath: `${directoryFolder}/${lowerDistrict}/${lowerSubDistrict}/${Date.now()}-${file.originalname}`,
            });

            // Save the image to the file system
            const dir = `${directoryFolder}/${lowerDistrict}/${lowerSubDistrict}`;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(newImage.imagePath, file.buffer);

            return newImage.save();
        }));

        res.send({
            message: 'Images uploaded successfully',
            images: savedImages
        });
    } catch (error) {
        res.status(500).send('Error uploading images');
    }
});

router.get('/images',async(req,res)=>{
    try{
        const posts = await ImageModel.find();
        res.status(200).json(posts);
    }catch(err){
        res.status(500).json({error:"Failed to load data"});
    }
});


// Set up a GET route to search images by district or subDistrict
router.get('/search-images', async (req, res) => {
    const { district,subDistrict } = req.query;

    // Ensure at least one of district or subDistrict is provided
    if (!district && !subDistrict) {
        return res.status(400).send('District or subDistrict name is required for searching');
    }
    try {
        const query = {};

        // Convert the search terms to lowercase
        if (district) query.district = district.toLowerCase();
        if (subDistrict) query.subDistrict = subDistrict.toLowerCase();

        const images = await ImageModel.find(query);

        if (images.length === 0) {
            return res.status(404).send('No images found for the specified district or subDistrict');
        }
        res.send(images);
    } catch (error) {
        res.status(500).send('Error retrieving images');
    }
});

module.exports=router;

