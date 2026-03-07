import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import { uploadVideo, deleteVideo,updateVideoDetails } from "../controllers/video.controllers.js";
import { upload } from "../middleware/multer.middlewares.js";

const router = Router();

router
  .route("/upload-video")
  .post(verifyJWT, upload.single("videoFile"), uploadVideo);

router.route("/delete-video/:id").delete(verifyJWT, deleteVideo);
router.route("/update-video-details/:id").patch(verifyJWT,updateVideoDetails);

export default router;
