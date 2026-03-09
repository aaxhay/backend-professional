import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";

const router = Router();

router.use(verifyJWT)

// router.route("/get-all-comments").get(getAllComments)

export default router;
