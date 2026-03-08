import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import { createPlaylist } from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT,createPlaylist);

export default router;