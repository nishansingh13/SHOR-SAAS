import mongoose from 'mongoose';

const { Schema } = mongoose;

const templateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['html', 'pdf', 'image'], default: 'html', required: true },
    content: { type: String, required: true },
    placeholders: { type: [String], default: [] },
    previewUrl: { type: String },
  backgroundImage: { type: String },
  organiserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const TemplateModel = mongoose.models.Template || mongoose.model('Template', templateSchema);
export default TemplateModel;
