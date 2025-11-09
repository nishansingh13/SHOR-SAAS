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
  organiserId: req.user?.userId,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error('createTemplate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTemplates = async (req, res) => {
  try {
  const isOrganizer = req.user?.role === 'organizer';
  const filter = isOrganizer ? { organiserId: req.user.userId } : {};
  const list = await TemplateModel.find(filter).sort({ createdAt: -1 });
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
  const filter = req.user?.role === 'organizer' ? { _id: id, organiserId: req.user.userId } : { _id: id };
  const updated = await TemplateModel.findOneAndUpdate(filter, payload, { new: true });
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
  const filter = req.user?.role === 'organizer' ? { _id: id, organiserId: req.user.userId } : { _id: id };
  const deleted = await TemplateModel.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ error: 'Template not found' });
    return res.json({ success: true, id })
  } catch (err) {
    console.error('deleteTemplate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
