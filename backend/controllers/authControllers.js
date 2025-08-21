import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.models.js';

const ensureDemoUsers = async () => {
  const adminEmail = 'admin@example.com';
  const orgEmail = 'organizer@example.com';
  const password = 'password';

  const [admin, organizer] = await Promise.all([
    UserModel.findOne({ email: adminEmail }),
    UserModel.findOne({ email: orgEmail }),
  ]);

  const hash = await bcrypt.hash(password, 10);

  const ops = [];
  if (!admin) {
    ops.push(UserModel.create({ name: 'John Admin', email: adminEmail, password: hash, role: 'admin' }));
  }
  if (!organizer) {
    ops.push(UserModel.create({ name: 'Jane Organizer', email: orgEmail, password: hash, role: 'organizer' }));
  }
  if (ops.length) await Promise.all(ops);
};

export const verify = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    return res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await UserModel.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await UserModel.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email: String(email).toLowerCase().trim(),
      password: hash,
      role: role === 'admin' ? 'admin' : 'organizer',
    });

    return res.status(201).json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};