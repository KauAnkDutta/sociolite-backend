const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images")
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    }
});

const upload = multer({
    storage: storage,
}).single("file");

module.exports = upload;