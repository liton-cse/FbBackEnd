const mongoose = require('mongoose')
const AboutSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
});

const createAboutModel = (db)=>{
    return db.model('AboutCollection',AboutSchema);
}
module.exports= createAboutModel;