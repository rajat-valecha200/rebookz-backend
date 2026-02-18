import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Config from './models/Config';
import connectDB from './config/db';

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await connectDB();

        const superAdminEmail = 'rajatvalecha@rebookz.com';
        const userExists = await User.findOne({ email: superAdminEmail });

        if (!userExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('superadmin123', salt);

            await User.create({
                name: 'Super Admin',
                email: superAdminEmail,
                password: hashedPassword,
                role: 'admin',
                isHiddenAdmin: true,
            });
            console.log('Super Admin created successfully');
        } else {
            userExists.role = 'admin';
            userExists.isHiddenAdmin = true;
            await userExists.save();
            console.log('Existing user promoted to Super Admin');
        }

        // Seed default config
        const configExists = await Config.findOne({ key: 'showDummyLogin' });
        if (!configExists) {
            await Config.create({
                key: 'showDummyLogin',
                value: true,
                description: 'Show "Continue as Dummy User" button on login screen'
            });
            console.log('Default config "showDummyLogin" created');
        }

        console.log('Seeding complete.');
        process.exit();
    } catch (error) {
        console.error('Error seeding super admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
