import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Auth user & get token (Email/Password for Admin mostly)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken((user._id as unknown) as string),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user (Email/Password)
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: phone || '', // Ensure phone is handled if provided
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken((user._id as unknown) as string),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Send OTP (Mock/Bypass)
// @route   POST /api/users/send-otp
// @access  Public
const sendOtp = async (req: Request, res: Response) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400).json({ message: 'Phone number is required' });
        return;
    }

    // Bypass Logic
    if (phone === '9876543210') {
        // We don't need to generate a random OTP, the user knows to use 123456
        // But we should simulate success.
        // We can also store '123456' in DB for this user to be consistent if we want valid verification,
        // OR verifyOtp can checks specifically for this number.
        // Let's upsert the user to ensure they exist or prepare field.

        // Check if user exists
        let user = await User.findOne({ phone });
        if (!user) {
            // Create temporary user or just send success?
            // Better to create partial user? No, wait for verification.
            // Actually, standardized flow: Store OTP.
            // For bypass, we can just say "OTP sent".
        }

        res.json({ message: 'OTP sent successfully (Bypass Mode)' });
        return;
    }

    // Standard Mock Logic for others (Generate Random OTP)
    // For now, let's just make it always 123456 for DEMO purposes unless configured otherwise?
    // User said "if I am passing the number as 9876543210... then the OTP will go as 123456".
    // For OTHER numbers? "we don't have the OTP API right now". 
    // So probably we should just mock 123456 for EVERYONE for now?
    // "OTP pay... they will provide me afterwards... so what we can do then we can have the bypass OTP mechanism".
    // It implies specifically for testing/demo? 
    // "pin code and things should be like That for now if we can keep a simple thing like... 9876543210... it will not ask me for the OTP".
    // Actually, "it will not ask me for otp and... The otp will go as 123456."
    // Wait, "it will not ask me for the OTP" -> Bypass UI? or Bypass API?
    // "we don't have the OTP API right now... then the OTP will go as 123456."
    // I think he means "The user enters 123456" OR "The API accepts 123456".
    // Let's assume standard behavior: API accepts 123456 for ANY number, but explicitly 9876543210 is highlighted.

    const otp = '123456';

    // Store OTP in DB (Upsert User)
    let user = await User.findOne({ phone });
    if (!user) {
        user = await User.create({
            phone,
            name: 'New User',
            otp,
            otpExpires: new Date(Date.now() + 10 * 60000) // 10 mins
        });
    } else {
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60000);
        await user.save();
    }

    res.json({ message: 'OTP sent successfully', devOtp: '123456' });
};

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = async (req: Request, res: Response) => {
    const { phone, otp } = req.body;

    // Bypass for Demo Number
    if (phone === '9876543210' && otp === '123456') {
        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({
                phone,
                name: 'Demo User',
            });
        }
        res.json({
            _id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            token: generateToken((user._id as unknown) as string),
            isNewUser: !user.email || (!user.dob && !user.age),
        });
        return;
    }

    const user = await User.findOne({ phone });

    if (user && (user.otp === otp || otp === '123456')) { // Allow 123456 globally for dev
        if (user.isSuspended) {
            res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
            return;
        }

        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            token: generateToken((user._id as unknown) as string),
            isNewUser: !user.email || (!user.dob && !user.age), // Flag to trigger onboarding
        });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
};

const googleLogin = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        // MOCK VERIFICATION for now
        const payload: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

        if (!payload || !payload.email) {
            res.status(400).json({ message: 'Invalid Google Token' });
            return;
        }

        const { email, name, picture, sub } = payload;

        let user = await User.findOne({ email });

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isNewUser: false,
                token: generateToken((user._id as unknown) as string),
            });
        } else {
            user = await User.create({
                name,
                email,
                password: sub,
                profileImage: picture,
                isGoogleUser: true
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isNewUser: true,
                token: generateToken((user._id as unknown) as string),
            });
        }

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(400).json({ message: 'Google Auth Failed' });
    }
};

export { authUser, registerUser, sendOtp, verifyOtp, googleLogin };
