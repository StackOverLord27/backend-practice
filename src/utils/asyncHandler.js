// Using try-catch block
/*
const asyncHandler= (requestHandler)=> async (req, res, next) => {
    try{
        await requestHandler()
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
*/


// Using Promises

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export {asyncHandler}