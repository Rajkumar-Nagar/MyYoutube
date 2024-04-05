
const asyncHanlder = (requsestHandeler) => {
    return async(req, res, next) => {
        Promise.resolve(requsestHandeler(req, res, next)).catch((err) => next(err))
    }
}

// const asyncHanlder = (requestHandler) => {
//     return async (req, res, next) => {
//         try {
//             await requestHandler(req, res, next);
//         } catch (error) {
//             next(error); // Pass the error to the next middleware
//         }
//     };
// };

export { asyncHanlder };






// const asyncHanlder = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

