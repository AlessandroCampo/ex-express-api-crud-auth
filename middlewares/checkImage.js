
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const storage = require('../utils/storage.js');
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});




const uploadFile = (req, res, next) => {
    upload.single('image')(req, res, async function (err) {
        if (err) {
            fs.unlinkSync(req.file.path);
            return next(err);
        } else if (!req.file) {
            return next();
        }

        if (req.file.size > (10 * 1024 * 1024)) {
            fs.unlinkSync(req.file.path);
            return next(new Error('File size exceeded the limit'));
        }

        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            fs.unlinkSync(req.file.path);
            return next(new Error('File must be a JPG, JPEG, or PNG image'));
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        req.body.image = `${baseUrl}/uploads/${req.file.filename}`;

        next();
    });
};

module.exports = uploadFile;
