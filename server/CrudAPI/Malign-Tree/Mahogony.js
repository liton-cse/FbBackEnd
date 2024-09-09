const express= require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('../../DatabaseConfig/database');
require('dotenv').config();
const {createMahogonyModel} = require('../../models/malign-tree/TreeSchema');
const multer = require('multer');
const cookiePerser =require('cookie-parser');
const router = express.Router();
const path = require("path");
router.use(cookiePerser());

//Connecting to database.. "Slide-Collection"....
const Mahogony = connectToDatabase('Mahogony',process.env.MONGODB_URI_MALIGNTREE);
const MahogonyModel= createMahogonyModel(Mahogony);
//middleware .......
express().use(bodyParser.json());

// Set up Multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads/malign-tree/mahogony/');
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storage,
    limits: { fileSize: 100000000 }, // 1MB limit
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

  // creating a collection in mongodb and store data,,,,,,,,

router.post('/mahogony', upload.single('image'), (req, res) => {
    const mahogonyPost = new MahogonyModel({
      title: req.body.title,
      description:req.body.description,
      image: req.file ? req.file.filename : '',
    });
    
    mahogonyPost.save()
      .then(mahogonyPost=> res.json({mesaage:"Post Save successfully",mahogonyPost})
    )
      .catch(err => res.status(400).json({ error: err.message }));
  });

  //get All data from mongodb collection "NewsCollection",,,,

router.get('/mahogony', (req, res) => {
    MahogonyModel.find()
      .then(post => res.json(post))
      .catch(err => res.status(400).json({ error: err.message }));
  });

  
 // get specific data by Id.....
 router.get('/mahogony/:id', (req, res) => {
    const _id = req.params.id;
    MahogonyModel.findById(_id)
      .then(post => res.json({message:`get data id ${_id}`,post}))
      .catch(err => res.status(400).json({ error: err.message }));
  });

   // Updating the news over its id....
 router.put('/mahogony/:id', upload.single('image'), (req, res) => {
    MahogonyModel.findById(req.params.id)
      .then(mahogonyData => {
        mahogonyData.title = req.body.title || mahogonyData.title;
        mahogonyData.description= req.body.description || mahogonyData.description;
        mahogonyData.image = req.file ? req.file.filename : mahogonyData.image;
        mahogonyData.save()
          .then(updatedData => res.json({message:"Data Update Successfully",updatedData}))
          .catch(err => res.status(400).json({ error: err.message }));
      })
      .catch(err => res.status(400).json({ error: err.message }));
  });

  router.delete('/mahogony/:id', (req, res) => {
    MahogonyModel.findByIdAndDelete(req.params.id)
      .then(() => res.json({message:"Deleted successfully", success: true }))
      .catch(err => res.status(400).json({ error: err.message }));
  });


  module.exports= router;