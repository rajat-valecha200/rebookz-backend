import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rajatvalecha200_db_user:VPQLYWUswGsGYPbn@cluster0.ujq4hy2.mongodb.net/rebookz?retryWrites=true&w=majority&appName=Cluster0';

const UserSchema = new mongoose.Schema({
    phone: String,
    email: String,
});

const User = mongoose.model('User', UserSchema);

async function cleanData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const demoPhones = ['9876543210', '966500000000'];

        const result = await User.deleteMany({
            phone: { $in: demoPhones }
        });

        console.log(`Successfully deleted ${result.deletedCount} demo users.`);

        // Also reset any user named "Demo User" or "New User" just in case
        const result2 = await User.deleteMany({
            name: { $in: ['Demo User', 'New User', 'Apple User', 'Google User'] }
        });
        console.log(`Successfully deleted ${result2.deletedCount} placeholder users.`);

        process.exit(0);
    } catch (error) {
        console.error('Error cleaning data:', error);
        process.exit(1);
    }
}

cleanData();
