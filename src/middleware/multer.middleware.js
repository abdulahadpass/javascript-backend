import multer from "multer";

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp'); // where the files will be stored temporarily
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // set the filename as the original file name
    }
});

export const upload = multer({ storage });