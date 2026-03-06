import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  registerUser,
  updateAvatarImage,
  updateCoverImage,
  updateUserDetails,
} from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middlewares.js";
import { verifyJWT } from "../middleware/auth.middlewares.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateAvatarImage);
router.route("/update-cover-image").post(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/update-user-details").post(verifyJWT,updateUserDetails);
router.route("/update-user-password").post(verifyJWT,changePassword);
router.route("/get-current-user").get(verifyJWT,getCurrentUser);


export default router;
