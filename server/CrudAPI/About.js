const express= require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('../DatabaseConfig/database');
require('dotenv').config();
const createAboutModel = require('../models/AboutSchema');
const multer = require('multer');
const cookiePerser =require('cookie-parser');
const router = express.Router();
const path = require("path");
router.use(cookiePerser());

//Connecting to database.. "Slide-Collection"....
const AboutCollection = connectToDatabase('AboutCollection',process.env.MONGODB_URI_NEWSDB);
const AboutModel= createAboutModel(AboutCollection);
//middleware .......
express().use(bodyParser.json());

// Set up Multer for file uploads
const uploadDir = path.join(__dirname, '../uploads/about-image/');
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
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

  //router.use('/uploads/About-Image', express.static(uploadDir));

  // creating a collection in mongodb and store data,,,,,,,,

router.post('/about', upload.single('image'), (req, res) => {
    const newAbout = new AboutModel({
      title: req.body.title,
      description:req.body.description,
      image: req.file ? req.file.filename : '',
    });
    
    newAbout.save()
      .then(newAbout=> res.json({mesaage:"Post Save successfully",newAbout})
    )
      .catch(err => res.status(400).json({ error: err.message }));
  });

  //get All data from mongodb collection "NewsCollection",,,,

router.get('/about', (req, res) => {
    AboutModel.find()
      .then(abouts => res.json(abouts))
      .catch(err => res.status(400).json({ error: err.message }));
  });

  
 // get specific data by Id.....
 router.get('/about/:id', (req, res) => {
    const _id = req.params.id;
    AboutModel.findById(_id)
      .then(about => res.json({message:`get data id ${_id}`,about}))
      .catch(err => res.status(400).json({ error: err.message }));
  });

   // Updating the news over its id....
 router.put('/about/:id', upload.single('image'), (req, res) => {
    AboutModel.findById(req.params.id)
      .then(about => {
        about.title = req.body.title || about.title;
        about.description= req.body.description || about.description;
        about.image = req.file ? req.file.filename : about.image;
        about.save()
          .then(updatedSlide => res.json({message:"Data Update Successfully",updatedSlide}))
          .catch(err => res.status(400).json({ error: err.message }));
      })
      .catch(err => res.status(400).json({ error: err.message }));
  });

  router.delete('/about/:id', (req, res) => {
    AboutModel.findByIdAndDelete(req.params.id)
      .then(() => res.json({message:"Deleted successfully", success: true }))
      .catch(err => res.status(400).json({ error: err.message }));
  });


  module.exports= router;