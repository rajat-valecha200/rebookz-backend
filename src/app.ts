import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import mobileRoutes from './routes/mobileRoutes';
import requestRoutes from './routes/requestRoutes';
import supportRoutes from './routes/supportRoutes';

dotenv.config();

connectDB();

const app: Application = express();
import morgan from 'morgan';
app.use(morgan('dev'));

app.use(cors({
    origin: '*', // For development, allow all. For production, specify domains.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/support', supportRoutes);

// Make uploads folder static
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req: Request, res: Response) => {
    res.send('API is running...');
});

export default app;
