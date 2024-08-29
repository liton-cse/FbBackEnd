const express= require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('../../DatabaseConfig/database');
require('dotenv').config();
const {createAkashMoniModel} = require('../../models/malign-tree/TreeSchema');
const multer = require('multer');
const cookiePerser =require('cookie-parser');
const router = express.Router();
const path = require("path");
router.use(cookiePerser());

//Connecting to database.. "Slide-Collection"....
const AkashMoni = connectToDatabase('AkashMoni',process.env.MONGODB_URI_MALIGNTREE);
const AkashMoniModel= createAkashMoniModel(AkashMoni);
//middleware .......
express().use(bodyParser.json());

// Set up Multer for file uploads
const uploadDir = path.resolve(__dirname, '../../../uploads/Akash-Moni');
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

  router.use('/upload/shisham-tree', express.static(uploadDir));

  // creating a collection in mongodb and store data,,,,,,,,

router.post('/akash-moni', upload.single('image'), (req, res) => {
    const AkashMoniPost = new AkashMoniModel({
      title: req.body.title,
      description:req.body.description,
      image: req.file ? req.file.path : '',
    });
    
    AkashMoniPost.save()
      .then(akashmoni=> res.json({mesaage:"Post Save successfully",akashmoni})
    )
      .catch(err => res.status(400).json({ error: err.message }));
  });

  //get All data from mongodb collection "NewsCollection",,,,

router.get('/akash-moni', (req, res) => {
    AkashMoniModel.find()
      .then(post => res.json(post))
      .catch(err => res.status(400).json({ error: err.message }));
  });

  
 // get specific data by Id.....
 router.get('/akash-moni/:id', (req, res) => {
    const _id = req.params.id;
   AkashMoniModel.findById(_id)
      .then(post => res.json({message:`get data id ${_id}`,post}))
      .catch(err => res.status(400).json({ error: err.message }));
  });

   // Updating the news over its id....
 router.put('/akash-moni/:id', upload.single('image'), (req, res) => {
    AkashMoniModel.findById(req.params.id)
      .then(akashmoniData => {
        akashmoniData.title = req.body.title || akashmoniData.title;
        akashmoniData.description= req.body.description || akashmoniData.description;
        akashmoniData.image = req.file ? req.file.path : akashmoniData.image;
        akashmoniData.save()
          .then(updatedData => res.json({message:"Data Update Successfully",updatedData}))
          .catch(err => res.status(400).json({ error: err.message }));
      })
      .catch(err => res.status(400).json({ error: err.message }));
  });

  router.delete('/akash-moni/:id', (req, res) => {
    AkashMoniModel.findByIdAndDelete(req.params.id)
      .then(() => res.json({message:"Deleted successfully", success: true }))
      .catch(err => res.status(400).json({ error: err.message }));
  });


  module.exports= router;