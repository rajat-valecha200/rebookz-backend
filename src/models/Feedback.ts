import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
    user: mongoose.Types.ObjectId;
    type?: string;
    content: string;
    rating?: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const feedbackSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['bug', 'suggestion', 'other'], default: 'suggestion' },
        content: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5 }, // Optional now
        comment: { type: String }, // Optional now
    },
    { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
