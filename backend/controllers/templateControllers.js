import TemplateModel from '../models/template.models.js';

export const createTemplate = async (req, res) => {
  try {
    const { name, type = 'html', content = '', placeholders = [], previewUrl, backgroundImage } = req.body || {};
    if (!name || !content) {
      return res.status(400).json({ error: 'name and content are required' });
    }

    const doc = await TemplateModel.create({
      name,
      type,
      content,
      placeholders,
      previewUrl,
      backgroundImage,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error('createTemplate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTemplates = async (_req, res) => {
  try {
    const list = await TemplateModel.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error('getTemplates error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await TemplateModel.findById(id);
    if (!doc) return res.status(404).json({ error: 'Template not found' });
    return res.json(doc);
  } catch (err) {
    console.error('getTemplateById error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const updated = await TemplateModel.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: 'Template not found' });
    return res.json(updated);
  } catch (err) {
    console.error('updateTemplate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TemplateModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Template not found' });
    return res.json({ success: true, id })
  } catch (err) {
    console.error('deleteTemplate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
