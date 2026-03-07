import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import {
  uploadVideo,
  deleteVideo,
  updateVideoDetails,
  getAllVideos
} from "../controllers/video.controllers.js";
import { upload } from "../middleware/multer.middlewares.js";

const router = Router();

router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo,
);

router.route("/delete-video/:id").delete(verifyJWT, deleteVideo);

router.route("/update-video-details/:id").patch(verifyJWT, updateVideoDetails);

router.route("/get-all-videos").get(verifyJWT, getAllVideos);

export default router;
