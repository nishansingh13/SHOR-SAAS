import bcrypt from "bcryptjs";
import RequestFromAdmin from "../models/requestfromAdmin.models.js";
import UserModel from "../models/user.models.js";
import EventModel from "../models/events.models.js";

export const approveOrganizer = async (req, res) => {
  try{
    const {id} = req.body;
    const OrganizerRequest = await RequestFromAdmin.findById(id);
    if(!OrganizerRequest){
      return res.status(404).json({error: "Organizer request not found"});
    }
    await RequestFromAdmin.findByIdAndUpdate(id,{$set : {status: "active"}});
    const hashedPassword =  await bcrypt.hash(OrganizerRequest.password, 10);
   const userModel = await UserModel.create({
      email : OrganizerRequest.email,
      password: hashedPassword,
      name: OrganizerRequest.name,
      GSTIN: OrganizerRequest.GSTIN
   })
    res.status(200).json(userModel);
  }catch(error){
    res.status(500).json({error: error.message});
  }
};

export const approveEvent = async (req, res) => {
    const {eventId} = req.body;
    console.log(eventId)
    const eventRequest = await EventModel.findById(eventId);
    if(!eventRequest){
      return res.status(404).json({error: "Event request not found"});
    }
    console.log('huih')
    await EventModel.findByIdAndUpdate(eventId,{$set : {status: "active"}});
    res.status(200).json(eventRequest);
};

export const fetchPendingOrganizers = async (req, res) => {
    try{
      const pendingOrganizers = await RequestFromAdmin.find({ status: "pending" });
      res.status(200).json(pendingOrganizers);
    }catch(error){
      res.status(500).json({error: error.message});
    }
};

export const fetchPendingEvents = async (req, res) => {
  try{
    const pendingEvents = await EventModel.find({ status: "pending" });
    res.status(200).json(pendingEvents);
  }catch(error){
    res.status(500).json({error: error.message});
  }
};
