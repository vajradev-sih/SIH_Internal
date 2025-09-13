import multer from 'multer';
import path from 'path';

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, 'uploads/photos');
        } else if (file.mimetype.startsWith('audio/')) {
            cb(null, 'uploads/audio');
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const uploadMiddleware = multer({ storage }).fields([
    { name: 'photo', maxCount: 1 },
    // Add the new field for the completion photo
    { name: 'completionPhoto', maxCount: 1 },
    { name: 'voiceRecording', maxCount: 1 }
]);

export { uploadMiddleware };