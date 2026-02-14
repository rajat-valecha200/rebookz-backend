import mongoose, { Document, Schema } from 'mongoose';

export interface IRecentView extends Document {
    user: mongoose.Types.ObjectId;
    book: mongoose.Types.ObjectId;
    viewedAt: Date;
}

const recentViewSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
        viewedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Index for fast queries and uniqueness
recentViewSchema.index({ user: 1, book: 1 }, { unique: true });

export default mongoose.model<IRecentView>('RecentView', recentViewSchema);
