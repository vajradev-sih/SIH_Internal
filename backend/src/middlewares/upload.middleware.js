

import fileUpload from 'express-fileupload';

export const uploadMiddleware = fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/' // Use a temporary directory
});