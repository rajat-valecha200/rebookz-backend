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
    isAppleUser?: boolean;
    appleId?: string;
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
        phone: { type: String, required: false, unique: true, sparse: true, default: undefined },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        profileImage: { type: String },
        rating: { type: Number, default: 0 },
        favorites: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
        otp: { type: String },
        otpExpires: { type: Date },
        isSuspended: { type: Boolean, default: false },
        isGoogleUser: { type: Boolean, default: false },
        isAppleUser: { type: Boolean, default: false },
        appleId: { type: String, unique: true, sparse: true },
        pushToken: { type: String },
        dob: { type: Date },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        age: { type: Number },
    },
    { timestamps: true }
);

// Pre-save hook to handle unique/sparse fields
userSchema.pre('save', function () {
    const user = this as any;
    if (user.phone === null || user.phone === '') {
        user.phone = undefined;
    }
    if (user.email === null || user.email === '') {
        user.email = undefined;
    }
});

export default mongoose.model<IUser>('User', userSchema);
