import EventModel from "../models/events.models.js";

export const saveEvent = async (req, res) => {
    const newEvent = new EventModel(req.body);
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
        
        const events = await EventModel.find();
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
};
export const updateEventById = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const updatedEvent = await EventModel.findByIdAndUpdate(id, updatedData, { new: true });
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
        const deleted = await EventModel.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.status(200).json({ success: true, id });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
};