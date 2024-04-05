import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))

app.use(express.urlencoded({ extended: true, limit: "16kb" }))


// to store the images and pdf file in public folder in our server
app.use(express.static("public"))
app.use(cookieParser())


// import router
import userRouter from "./routes/user.route.js"


// router declaration

app.use("/api/v1/users", userRouter)


export { app }