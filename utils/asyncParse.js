const formidable = require("formidable");

exports.asyncParse = (req) =>
  new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    // Parse the incoming request
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
