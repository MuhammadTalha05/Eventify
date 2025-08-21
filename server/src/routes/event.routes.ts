import { Router } from "express";
import * as ctrl from"../controllers/event.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { uploadEventMedia } from "../utils/event.cloudinary.util";

const router = Router();

// Create Event
router.post("/create", requireAuth, requireRole("ADMIN"), uploadEventMedia , ctrl.createEventController);

// Update Event
router.put("/update/:id", requireAuth, requireRole("ADMIN"), uploadEventMedia , ctrl.updateEventController);

// Update Event Status
router.put("/status/:id", requireAuth, requireRole("ADMIN"), ctrl.updateEventStatusController);

// Delete Event
router.delete("/delete/:id", requireAuth, requireRole("ADMIN") , ctrl.deleteEventController);

// Delete a specific attachment by ID (attachmentId in params)
router.delete("/delete/attachment/:id", requireAuth, requireRole("ADMIN"), ctrl.deleteEventAttachmentController);

// Get My Events
router.get("/all/me", requireAuth, requireRole("ADMIN") , ctrl.getMyEventsController);

// Get All Events
router.get("/all", ctrl.getAllEventsController);

// Get single event
router.get("/:id", ctrl.getEventByIdController);


export default router;
