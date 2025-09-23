import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { getRoomMessages } from "../controllers/messages.controller";

const router = Router();

router.use(requireAuth);
router.get("/rooms/:roomId/messages", getRoomMessages);

export default router;
