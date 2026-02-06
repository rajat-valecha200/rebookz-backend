import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
    user?: mongoose.Types.ObjectId; // Optional if guest
    contactEmail?: string; // Optional if logged in
    contactPhone?: string; // Optional
    category: string;
    description: string;
    status: 'open' | 'in_progress' | 'closed';
    adminResponse?: string;
    createdAt: Date;
    updatedAt: Date;
}

const supportTicketSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' }, // Populated if logged in
        contactEmail: { type: String }, // For guests or updates
        contactPhone: { type: String },
        category: { type: String, required: true },
        description: { type: String, required: true },
        status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
        adminResponse: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);
