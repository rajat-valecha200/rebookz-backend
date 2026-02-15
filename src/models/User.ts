import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email?: string;
    password?: string;
    phone: string;
    role: 'user' | 'admin';
    profileImage?: string;
    rating?: number;
    favorites: mongoose.Types.ObjectId[];
    otp?: string;
    otpExpires?: Date;
    isSuspended?: boolean;
    isGoogleUser?: boolean;
    pushToken?: string;
    createdAt: Date;
    updatedAt: Date;
    dob?: Date;
    gender?: 'male' | 'female' | 'other';
    age?: number;
}

const userSchema: Schema = new Schema(
    {
        name: { type: String, default: 'New User' },
        email: { type: String, unique: true, sparse: true },
        password: { type: String, required: false }, // optional for now if using social auth or placeholder
        phone: { type: String, required: false, unique: true, sparse: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        profileImage: { type: String },
        rating: { type: Number, default: 0 },
        favorites: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
        otp: { type: String },
        otpExpires: { type: Date },
        isSuspended: { type: Boolean, default: false },
        isGoogleUser: { type: Boolean, default: false },
        pushToken: { type: String },
        dob: { type: Date },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        age: { type: Number },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
