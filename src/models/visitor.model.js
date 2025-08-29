import mongoose from "mongoose";
const visiterSchema = new mongoose.Schema({
    visitorId:{
        type:String,
        required:true,
    },
    city:{
        type:String,
    },
    ip:{
        type:String, 
    },
    region:{
        type:String,
    },
    country:{
        type:String,
    },
    postal:{
        type:String,
    },
    utmSource:{
        type:String,
    },
   location: {
  lat: { type: String, required: true },
  long: { type: String, required: true },
}

},{timestamps:true})

const Visiter = mongoose.model('visiter', visiterSchema);
export default Visiter;
