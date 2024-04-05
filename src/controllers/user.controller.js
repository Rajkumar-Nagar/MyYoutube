import { asyncHanlder } from "../utils/asynchandler.js";

const registerUser = asyncHanlder(async (req, res) => {
    res.status(200).json({
        messgae: "ok"
    })
})

export { registerUser }