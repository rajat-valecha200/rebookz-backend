import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import connectDB from './config/db';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'info.rebookz@gmail.com';
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists');
            console.log('Email:', adminEmail);
            console.log('If you forgot the password, you may need to delete this user from DB manually.');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const passwordStart = 'admin123';
        const hashedPassword = await bcrypt.hash(passwordStart, salt);

        const adminUser = await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: hashedPassword,
            phone: '0000000000',
            role: 'admin',
        });

        console.log('Admin user created successfully');
        console.log('Email:', adminEmail);
        console.log('Password:', passwordStart);
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
