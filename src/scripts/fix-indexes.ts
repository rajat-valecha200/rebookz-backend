
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rebookz';

async function fixIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        console.log('Checking existing indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // Drop the phone_1 index if it exists
        if (indexes.some(idx => idx.name === 'phone_1')) {
            console.log('Dropping phone_1 index...');
            await collection.dropIndex('phone_1');
            console.log('Dropped.');
        }

        // Drop the email_1 index if it exists
        if (indexes.some(idx => idx.name === 'email_1')) {
            console.log('Dropping email_1 index...');
            await collection.dropIndex('email_1');
            console.log('Dropped.');
        }

        console.log('Cleaning up existing null values...');
        await collection.updateMany({ phone: null }, { $unset: { phone: "" } });
        await collection.updateMany({ email: null }, { $unset: { email: "" } });
        console.log('Cleanup complete.');

        console.log('Recreating sparse unique indexes...');
        await collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
        await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        console.log('Indexes recreated successfully.');

        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
}

fixIndexes();
