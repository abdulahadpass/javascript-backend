import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async()=>{
    try {
        console.log("Connecting to MongoDB...", process.env.MONGO_DB_URI)
       const connectionIntance = await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`)
       console.log(`/n MongoDB connected !! DB-Host${connectionIntance.connection.host}`)
    } catch (error) {
        console.log("MongoDB connectioon Error", error)
        process.exit(1)
    }
}

export default connectDB