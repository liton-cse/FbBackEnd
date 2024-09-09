const express= require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('../../DatabaseConfig/database');
require('dotenv').config();
const {createShishamTreeModel} = require('../../models/malign-tree/TreeSchema');
const multer = require('multer');
const cookiePerser =require('cookie-parser');
const router = express.Router();
const path = require("path");
router.use(cookiePerser());

//Connecting to database.. "Slide-Collection"....
const ShishamTree = connectToDatabase('ShishamTree',process.env.MONGODB_URI_MALIGNTREE);
const ShishamTreeModel= createShishamTreeModel(ShishamTree);
//middleware .......
express().use(bodyParser.json());

// Set up Multer for file uploads
const uploadDir = path.resolve(__dirname, '../../uploads/malign-tree/shisham-tree');
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

router.post('/shisham-tree', upload.single('image'), (req, res) => {
    const ShishamTreePost = new ShishamTreeModel({
      title: req.body.title,
      description:req.body.description,
      image: req.file ? req.file.filename : '',
    });
    
    ShishamTreePost.save()
      .then(ShishamTree=> res.json({mesaage:"Post Save successfully",ShishamTree})
    )
      .catch(err => res.status(400).json({ error: err.message }));
  });

  //get All data from mongodb collection "NewsCollection",,,,

router.get('/shisham-tree', (req, res) => {
    ShishamTreeModel.find()
      .then(post => res.json(post))
      .catch(err => res.status(400).json({ error: err.message }));
  });

  
 // get specific data by Id.....
 router.get('/shisham-tree/:id', (req, res) => {
    const _id = req.params.id;
    ShishamTreeModel.findById(_id)
      .then(post => res.json({message:`get data id ${_id}`,post}))
      .catch(err => res.status(400).json({ error: err.message }));
  });

   // Updating the news over its id....
 router.put('/shisham-tree/:id', upload.single('image'), (req, res) => {
    ShishamTreeModel.findById(req.params.id)
      .then(shishamTreeData => {
        shishamTreeData.title = req.body.title || shishamTreeData.title;
        shishamTreeData.description= req.body.description || shishamTreeData.description;
        shishamTreeData.image = req.file ? req.file.filename : shishamTreeData.image;
        shishamTreeData.save()
          .then(updatedData => res.json({message:"Data Update Successfully",updatedData}))
          .catch(err => res.status(400).json({ error: err.message }));
      })
      .catch(err => res.status(400).json({ error: err.message }));
  });

  router.delete('/shisham-tree/:id', (req, res) => {
    ShishamTreeModel.findByIdAndDelete(req.params.id)
      .then(() => res.json({message:"Deleted successfully", success: true }))
      .catch(err => res.status(400).json({ error: err.message }));
  });


  module.exports= router;