// responseHelper.js

const sendResponse = (res, success, message, data = null, code = 200) => {
    res.status(code).send({
      success,
      message,
      data,
      code,
    });
  };
  
  module.exports = sendResponse;