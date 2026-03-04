// const asyncHandler = (requestHandler) => async (req, res) => {
//   try {
//     return await requestHandler(req, res);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       message: error.message,
//       success: false,
//     });
//   }
// };

// const asyncHandler = (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { asyncHandler };
