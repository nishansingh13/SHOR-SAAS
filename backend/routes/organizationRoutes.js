import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
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

// Create organization
router.post('/organizations', authenticateToken, createOrganization);

// Get all organizations (admin only)
router.get('/organizations', authenticateToken, getAllOrganizations);

// Get user's organization
router.get('/organizations/my-organization', authenticateToken, getUserOrganization);

// Get organization by ID
router.get('/organizations/:id', authenticateToken, getOrganizationById);

// Update organization
router.put('/organizations/:id', authenticateToken, updateOrganization);

// Add member to organization
router.post('/organizations/:id/members', authenticateToken, addMember);

// Remove member from organization
router.delete('/organizations/:id/members/:memberId', authenticateToken, removeMember);

// Delete organization
router.delete('/organizations/:id', authenticateToken, deleteOrganization);

export default router;
