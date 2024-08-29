const express= require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('../../DatabaseConfig/database');
require('dotenv').config();
const {createEucalyptusModel} = require('../../models/malign-tree/TreeSchema');
const multer = require('multer');
const cookiePerser =require('cookie-parser');
const router = express.Router();
const path = require("path");
router.use(cookiePerser());

//Connecting to database.. "Slide-Collection"....
const Eucalyptus = connectToDatabase('Eucalyptus',process.env.MONGODB_URI_MALIGNTREE);
const EucalyptusModel= createEucalyptusModel(Eucalyptus );
//middleware .......
express().use(bodyParser.json());

// Set up Multer for file uploads
const uploadDir = path.resolve(__dirname, '../../../uploads/Eucalyptus');
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

  router.use('/upload/eucalyptus', express.static(uploadDir));

  // creating a collection in mongodb and store data,,,,,,,,

router.post('/eucalyptus', upload.single('image'), (req, res) => {
    const eucalyptusPost = new EucalyptusModel({
      title: req.body.title,
      description:req.body.description,
      image: req.file ? req.file.path : '',
    });
    
    eucalyptusPost.save()
      .then(eucalyptusPost=> res.json({mesaage:"Post Save successfully",eucalyptusPost})
    )
      .catch(err => res.status(400).json({ error: err.message }));
  });

  //get All data from mongodb collection "NewsCollection",,,,

router.get('/eucalyptus', (req, res) => {
    EucalyptusModel.find()
      .then(post => res.json(post))
      .catch(err => res.status(400).json({ error: err.message }));
  });

  
 // get specific data by Id.....
 router.get('/eucalyptus/:id', (req, res) => {
    const _id = req.params.id;
    EucalyptusModel.findById(_id)
      .then(post => res.json({message:`get data id ${_id}`,post}))
      .catch(err => res.status(400).json({ error: err.message }));
  });

   // Updating the news over its id....
 router.put('/eucalyptus/:id', upload.single('image'), (req, res) => {
    EucalyptusModel.findById(req.params.id)
      .then(eucalyptusData => {
        eucalyptusData.title = req.body.title || eucalyptusData.title;
        eucalyptusData.description= req.body.description || eucalyptusData.description;
        eucalyptusData.image = req.file ? req.file.path : eucalyptusData.image;
        eucalyptusData.save()
          .then(updatedData => res.json({message:"Data Update Successfully",updatedData}))
          .catch(err => res.status(400).json({ error: err.message }));
      })
      .catch(err => res.status(400).json({ error: err.message }));
  });

  router.delete('/eucalyptus/:id', (req, res) => {
    EucalyptusModel.findByIdAndDelete(req.params.id)
      .then(() => res.json({message:"Deleted successfully", success: true }))
      .catch(err => res.status(400).json({ error: err.message }));
  });


  module.exports= router;