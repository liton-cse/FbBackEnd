const express= require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require("../DatabaseConfig/database");
require('dotenv').config();
const createEventModel=require('../models/eventSchema');
const multer = require('multer');
const cookiePerser =require('cookie-parser');
const router = express.Router();
const path = require("path");
router.use(cookiePerser());

//Connecting to database.. "NewsCollection"....
const EventCollection = connectToDatabase('EventCollection',process.env.MONGODB_URI_NEWSDB);
const Event= createEventModel(EventCollection);
//middleware .......
express().use(bodyParser.json());

// Set up Multer for file uploads
const uploadDir = path.resolve(__dirname, '../uploads/event-image/');
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
//router.use('/uploads/eventImage', express.static(uploadDir));
//Upload Event in eventsCollections Database......
router.post('/events', upload.single('image'), (req, res) => {
    const { name,description,location ,date } = req.body;
    const image = req.file ? req.file.filename : null;
  
    const newEvent = new Event({ name,description,location, date, image });
  
    newEvent.save()
      .then(() => res.json({ message: 'Event created successfully!',newEvent }))
      .catch(err => res.status(400).json({ error: err.message }));
  });
  //get All Events.....
  router.get('/events', (req, res) => {
    Event.find()
      .then(events => res.json(events))
      .catch(err => res.status(400).json({ error: err.message }));
  });

  //Get Event by Id....
  router.get('/events/:id', (req, res) => {
    const {id}=req.params.id;
    Event.findById(id)
      .then(event => res.json(event))
      .catch(err => res.status(400).json({ error: err.message }));
  });

   // Updating the news over its id....
 router.put('/events/:id', upload.single('image'), (req, res) => {
    Event.findById(req.params.id)
      .then(event => {
        event.name = req.body.name || event.name;
        event.description = req.body.description || event.description;
        event.location = req.body.location || event.location;
        event.date=req.body.date || event.date;
        event.image = req.file ? req.file.filename : event.image;
        event.save()
          .then(updatedEvent => res.json({message:"Data Update Successfully",updatedEvent}))
          .catch(err => res.status(400).json({ error: err.message }));
      })
      .catch(err => res.status(400).json({ error: err.message }));
  });

    // deleting news over its id.......

    router.delete('/events/:id', (req, res) => {
        Event.findByIdAndDelete(req.params.id)
          .then(() => res.json({ success: true }))
          .catch(err => res.status(400).json({ error: err.message }));
      });
  module.exports=router;