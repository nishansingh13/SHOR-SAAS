import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { apiLimiter, createLimiter } from '../middleware/rateLimiter.js';
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  getUserOrganization,
  updateOrganization,
  addMember,
  removeMember,
  deleteOrganization,
} from '../controllers/organizationControllers.js';

const router = express.Router();

// Create organization (rate limited)
router.post('/organizations', authenticateToken, createLimiter, createOrganization);

// Get all organizations (admin only, rate limited)
router.get('/organizations', authenticateToken, apiLimiter, getAllOrganizations);

// Get user's organization (rate limited)
router.get('/organizations/my-organization', authenticateToken, apiLimiter, getUserOrganization);

// Get organization by ID (rate limited)
router.get('/organizations/:id', authenticateToken, apiLimiter, getOrganizationById);

// Update organization (rate limited)
router.put('/organizations/:id', authenticateToken, apiLimiter, updateOrganization);

// Add member to organization (rate limited)
router.post('/organizations/:id/members', authenticateToken, apiLimiter, addMember);

// Remove member from organization (rate limited)
router.delete('/organizations/:id/members/:memberId', authenticateToken, apiLimiter, removeMember);

// Delete organization (rate limited)
router.delete('/organizations/:id', authenticateToken, apiLimiter, deleteOrganization);

export default router;
