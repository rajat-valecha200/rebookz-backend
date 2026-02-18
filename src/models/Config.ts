import mongoose, { Document, Schema } from 'mongoose';

export interface IConfig extends Document {
    key: string;
    value: any;
    description?: string;
}

const configSchema: Schema = new Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: Schema.Types.Mixed, required: true },
        description: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IConfig>('Config', configSchema);
