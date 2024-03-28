import dotenv from "dotenv"
import connectDB from './db/db.js'

dotenv.config({
    path: "./.env"
})

connectDB()

// import mongoose from "mongoose";
// import { DB_Name } from "./constant";

// import { express } from "express";
// const app = express()

//     (
//         async () => {
//             try {
//                 await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`)
//                 app.on("error", (error) => {
//                     console.log("error", error)
//                     throw error
//                 })
//                 app.listen(process.env.PORT, () => {
//                     console.log(`app is running on port ${process.env.PORT}`)
//                 })
//             } catch (error) {
//                 console.log(error)
//                 throw error
//             }

//         }

//     )()