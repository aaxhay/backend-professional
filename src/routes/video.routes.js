import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import { uploadVideo } from "../controllers/video.controllers.js";
import { upload } from "../middleware/multer.middlewares.js";

const router = Router();

router
  .route("/upload-video")
  .post(verifyJWT, upload.single("videoFile"),uploadVideo);

export default router;
