import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
dotenv.config({
    path: "./.env",
})

const app = express()

connectDB ()
.then(()=>{
   app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
   })
})
.catch((error)=>{
    console.error("Error connecting to the database", error)
    process.exit(1)
})