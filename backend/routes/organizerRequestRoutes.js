import express from 'express';
import {
    createOrganizerRequest,
    getAllOrganizerRequests,
    getOrganizerRequestById,
    approveOrganizerRequest,
    rejectOrganizerRequest,
    updateOrganizerRequestStatus,
    deleteOrganizerRequest
} from '../controllers/organizerRequestController.js';
import { verifyUser } from '../middleware/verifyUser.js';
const router = express.Router();

router.post('/', createOrganizerRequest);
router.get('/', verifyUser, getAllOrganizerRequests);
router.get('/:id', verifyUser, getOrganizerRequestById);
router.post('/:id/approve', verifyUser, approveOrganizerRequest);
router.post('/:id/reject', verifyUser, rejectOrganizerRequest);
router.patch('/:id/status', verifyUser, updateOrganizerRequestStatus);
router.delete('/:id', verifyUser, deleteOrganizerRequest);

export default router;
