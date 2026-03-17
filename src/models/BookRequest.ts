import mongoose, { Document, Schema } from 'mongoose';

export interface IBookRequest extends Document {
    title: string;
    description: string;
    category: string;
    user: mongoose.Types.ObjectId;
    status: 'active' | 'fulfilled' | 'cancelled';
    region?: string;
    requesterPhone?: string;
    fulfilledBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const bookRequestSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        category: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['active', 'fulfilled', 'cancelled'], default: 'active' },
        region: { type: String, default: 'SA' }, // Default fallback
        requesterPhone: { type: String },
        fulfilledBy: { type: Schema.Types.ObjectId, ref: 'Book' }
    },
    { timestamps: true }
);

export default mongoose.model<IBookRequest>('BookRequest', bookRequestSchema);
