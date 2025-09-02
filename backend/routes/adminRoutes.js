import express from "express";
import { approveEvent, approveOrganizer, fetchPendingEvents, fetchPendingOrganizers } from "../controllers/admincontroller.js";
import { verifyUser } from "../middleware/verifyUser.js";
const router = express.Router();
router.post('/approve-organizer', verifyUser, approveOrganizer);
router.post('/approve-event', verifyUser, approveEvent);
router.get('/pending-organizers', verifyUser, fetchPendingOrganizers);
router.get('/pending-events', verifyUser, fetchPendingEvents);
export default router;