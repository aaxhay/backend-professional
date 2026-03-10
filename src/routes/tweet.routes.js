import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import {
  addTweet,
  deleteTweet,
  getAllTweets,
  updateTweet,
} from "../controllers/tweet.controllers.js";
import { upload } from "../middleware/multer.middlewares.js";

const router = Router();

router.use(verifyJWT);
router.use(upload.none());

router.route("/create-tweet").post(addTweet);
router.route("/update-tweet/:id").patch(updateTweet);
router.route("/get-all-tweets").get(getAllTweets);
router.route("/delete-tweet/:id").delete(deleteTweet);

export default router;
