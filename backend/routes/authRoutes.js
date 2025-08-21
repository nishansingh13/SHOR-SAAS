import express from 'express';
import { login, register, verify } from '../controllers/authControllers.js';
import { verifyUser } from '../middleware/verifyUser.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verify', verifyUser, verify);

export default router;
