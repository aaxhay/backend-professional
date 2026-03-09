import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import {
  getAllComments,
  addComment,
  updateComment,
} from "../controllers/comment.controllers.js";
const router = Router();

router.use(verifyJWT);

router.route("/add-comment/:videoId").post(addComment);
router.route("/get-all-comments").get(getAllComments);
router.route("/update-comment/:id").patch(updateComment);

export default router;
