const express= require('express');
const bodyParser = require('body-parser');
const connectToDatabase = require('../../DatabaseConfig/database');
require('dotenv').config();
const createVideoModel = require('../../models/gallary/VideoSchema');
const multer = require('multer');
const cookiePerser =require('cookie-parser');
const router = express.Router();
const path = require("path");
router.use(cookiePerser());
const fs = require('fs');

//Connecting to database.. "Video Collection"....
const VideoCollection = connectToDatabase('VideoCollection',process.env.MONGODB_URI_GALLARY);
const VideoModel= createVideoModel(VideoCollection);
//middleware .......
express().use(bodyParser.json());

// Configure multer storage
const storageEngine = multer.memoryStorage(); 
const upload = multer({ storage: storageEngine,
    limits: { fileSize: 100000000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
        }
 });

// Check File Type (only allow video files)
function checkFileType(file, cb) {
    const filetypes = /mp4|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Videos Only!');
    }
}

// Set up a POST route to handle image uploads
router.post('/videos', upload.array('video',10), async (req, res) => {
    const { district, subDistrict } = req.body;

    if (!district || !subDistrict) {
        return res.status(400).send('District and Sub-District names are required');
    }
    const folderDir = '../../uploadsGallary/videos'
    const directoryFolder = path.resolve(__dirname,folderDir);
    try {
        // Convert district and subDistrict to lowercase before storing
        const lowerDistrict = district.toLowerCase();
        const lowerSubDistrict = subDistrict.toLowerCase();

        // Save each image to MongoDB
        const savedVideos = await Promise.all(req.files.map(file => {
            const newVideo = new VideoModel({
                district: lowerDistrict,
                subDistrict: lowerSubDistrict,
                videoName: file.originalname,
                videoUpd:`${Date.now()}-${file.originalname}`,
                videoPath: `${directoryFolder}/${lowerDistrict}/${lowerSubDistrict}/${Date.now()}-${file.originalname}`,
            });

            // Save the image to the file system
            const dir = `${directoryFolder}/${lowerDistrict}/${lowerSubDistrict}`;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(newVideo.videoPath, file.buffer);

            return newVideo.save();
        }));

        res.send({
            message: 'Videos uploaded successfully',
            images: savedVideos
        });
    } catch (error) {
        res.status(500).send('Error uploading Videos');
    }
});

router.get('/videos',async(req,res)=>{
    try{
        const posts = await VideoModel.find();
        res.status(200).json(posts);
    }catch(err){
        res.status(500).json({error:"Failed to load data"});
    }
});
router.delete('/videos/:id',async(req,res)=>{
    const id= req.params.id;
    try{
        const video=await VideoModel.findByIdAndDelete(id);
        if (video) {
            fs.unlinkSync(video.videoPath); 
            res.status(200).json({ message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }

    }catch(error){
        res.status(500).json({error:"Failed to delete data"});
    }
});


// Set up a GET route to search videos by district or subDistrict
router.get('/search-videos', async (req, res) => {
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

        const videos = await VideoModel.find(query);

        if (videos.length === 0) {
            return res.status(404).send('No videos found for the specified district or subDistrict');
        }
        res.send(videos);
    } catch (error) {
        res.status(500).send('Error retrieving videos');
    }
});

module.exports=router;

