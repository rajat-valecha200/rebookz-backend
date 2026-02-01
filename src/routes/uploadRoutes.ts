import express, { Request, Response } from 'express';
import upload from '../middleware/uploadMiddleware';
import path from 'path';

const router = express.Router();

router.post('/', upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).send({ message: 'No file uploaded' });
        return;
    }
    res.send({
        message: 'Image uploaded',
        image: `/${req.file.path}`,
    });
});

export default router;
