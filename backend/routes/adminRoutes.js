import express from "express";
import { approveEvent, approveOrganizer, fetchPendingEvents, fetchPendingOrganizers } from "../controllers/admincontroller.js";
const router = express.Router();
router.post('/approve-organizer', approveOrganizer);
router.post('/approve-event', approveEvent);
router.get('/pending-organizers', fetchPendingOrganizers);
router.get('/pending-events', fetchPendingEvents);
export default router;