import mongoose from "mongoose";
import { DB_Name } from "../constant.js";

const connectDB = async () => {
    try {
        const connectionInstanse = await mongoose.connect(
            `${process.env.MONGO_URI}/${DB_Name}`
        )
        console.log(`mongoose connected !! DB Host : ${connectionInstanse.connection.host}` )
    } catch (error) {
        console.log("mongoose connection is failed", error)
        process.exit(1)
    }
}

export default connectDB