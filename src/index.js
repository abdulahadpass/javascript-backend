import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path: "./.env",
})



connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running onport ${process.env.PORT}`)
        })
        app.on("Error", (error) => {
            console.log(`Error: ${error}`)
        })
    }).catch((error) => {
        console.log(`Mongo DB connection failed!: ${error}`)
    })