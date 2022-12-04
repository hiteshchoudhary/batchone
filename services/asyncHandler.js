const asyncHandler = (fn) => async(req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (err) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}


export default asyncHandler;



// added by Anirudh 
// const asyncHandler = () => {};
// const asyncHandler = (func) => {};
// const asyncHandler = (func) => () => {};
// const asyncHandler = (func) => async () => {};


//added by Satyendra
// function asyncHandler(fn) {
//     return async function (req, res, next) {
//       try {
//         await fn(req, res, next);
//       } catch (err) {
//         res.status(err.code || 500).json({
//           success: false,
//         });
//       }
//     };
//   }