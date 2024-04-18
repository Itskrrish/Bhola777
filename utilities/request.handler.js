export const throwError = (status, errorType, errorMessage, errors = false) => {
  return (e) => {
    if (!e) e = new Error(errorMessage || "Default error occurred");
    e.status = status;
    e.errorType = errorType;
    e.errorMessage = errorMessage;
    if (errors !== false) e.errors = errors;
    throw e;
  };
};
export const throwIf = (fn, status, errorType, errorMessage) => {
  return (result) =>
    fn(result) ? throwError(status, errorType, errorMessage)() : result;
};


// export const asyncfunctionwrapper = async (fn,req,res) => {
//   try {
//     // Ensure req and res are available in the scope where asyncfunctionwrapper is called
   
//     const data = await fn(req , res); // Pass req and res to fn
//     return { success: true, error: null, data };
//   } catch (e) {
//     console.log(e);
//     return res.send({ status: false, error: true, message: "Something Went Wrong" });
//   }
// };