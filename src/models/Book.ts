import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
    title: string;
    author: string;
    description: string;
    category: string;
    subcategory?: string;
    condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
    type: 'sell' | 'donate';
    price: number;
    images: string[];
    seller: mongoose.Types.ObjectId;
    location: {
        type: 'Point';
        coordinates: number[];
        address: string;
    };
    isAvailable: boolean;
    status: 'available' | 'sold';
    distance?: number; // Calculated field usually
    // New Fields for Textbook/School support
    school?: string;
    board?: string; // e.g. CBSE, ICSE, Ministry
    classLevel?: string; // e.g. Grade 10, Year 12
    sellerPhone?: string; // Custom seller phone number
    region?: string; // Optional: To support app-wide regional content
    createdAt: Date;
    updatedAt: Date;
}

const bookSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        author: { type: String },
        description: { type: String },
        category: { type: String, required: true }, // Ideally ref but string for simplicity as per requirements
        subcategory: { type: String },
        condition: { type: String, required: true },
        type: { type: String, required: true },
        price: { type: Number, default: 0 },
        images: [{ type: String }],
        seller: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
                index: '2dsphere',
            }, // [longitude, latitude]
            address: { type: String },
        },
        isAvailable: { type: Boolean, default: true },
        status: { type: String, enum: ['available', 'sold'], default: 'available' },
        // New Schema Fields
        school: { type: String },
        board: { type: String },
        classLevel: { type: String },
        sellerPhone: { type: String }, // NEW
        region: { type: String, default: 'SA' }, // Defaulting fallback for backward compatibility
    },
    { timestamps: true }
);

export default mongoose.model<IBook>('Book', bookSchema);
