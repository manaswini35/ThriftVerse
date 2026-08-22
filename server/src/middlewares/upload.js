import multer from "multer";
import fs from "fs";
import path from "path";

// Files land here only long enough to be pushed to Cloudinary. multer won't
// create the folder itself, so make sure it's there before the first upload.
const UPLOAD_DIR = "uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },

    filename: function (req, file, cb) {
        // Strip spaces and anything path-like out of the original name.
        const safe = path
            .basename(file.originalname)
            .replace(/[^a-zA-Z0-9._-]/g, "_");

        cb(null, `${Date.now()}-${safe}`);
    },
});

const upload = multer({
    storage,

    limits: { fileSize: 5 * 1024 * 1024 },

    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) return cb(null, true);
        cb(new Error("Only image files are allowed"));
    },
});

export default upload;
