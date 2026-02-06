import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).json({ message: 'Not authorized, user not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

// Optional Auth: Parses token if present, but doesn't error if missing
const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
        } catch (error) {
            console.error("Optional Auth Token Failed:", error);
            // Continue without user
        }
    }
    next();
};

export { protect, admin, optionalAuth, AuthRequest };
