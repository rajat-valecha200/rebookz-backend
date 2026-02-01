import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    id: number;
    name: string;
    description?: string;
    has_child: boolean;
    parent_id?: number | null;
    icon_name: string;
    is_active: boolean;
    deleted_at?: Date | null;
}

const categorySchema: Schema = new Schema(
    {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true },
        description: { type: String },
        has_child: { type: Boolean, default: false },
        parent_id: { type: Number, default: null },
        icon_name: { type: String, default: 'book' },
        is_active: { type: Boolean, default: true },
        deleted_at: { type: Date, default: null }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model<ICategory>('Category', categorySchema);
