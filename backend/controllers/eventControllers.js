import EventModel from "../models/events.models.js";

export const saveEvent = async (req, res) => {
    const payload = { ...req.body };
    // Attach organizer for ownership
    if (req.user?.userId) {
        payload.organiserId = req.user.userId;
    }
    const newEvent = new EventModel(payload);
    try {
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error saving event:", error);
        res.status(500).json({ error: "Failed to save event" });
    }
};

export const getEvents = async (req, res) => {
    try {
        // Admins see all; organizers only their events
        const filter = req.user?.role === 'organizer' ? { organiserId: req.user.userId } : {};
        const events = await EventModel.find(filter);
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
};

// Public: list events for participant portal without authentication
export const getPublicEvents = async (_req, res) => {
    try {
        const events = await EventModel.find({});
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching public events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
};
export const updateEventById = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const filter = req.user?.role === 'organizer' ? { _id: id, organiserId: req.user.userId } : { _id: id };
        const updatedEvent = await EventModel.findOneAndUpdate(filter, updatedData, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Failed to update event" });
    }
};  

// New: Delete event by ID
export const deleteEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const filter = req.user?.role === 'organizer' ? { _id: id, organiserId: req.user.userId } : { _id: id };
        const deleted = await EventModel.findOneAndDelete(filter);
        if (!deleted) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.status(200).json({ success: true, id });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
};