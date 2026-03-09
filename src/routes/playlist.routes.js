import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import { createPlaylist, getAllPlaylists,searchPlaylist,deletePlaylist, addToPlaylist } from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT,createPlaylist);
router.route("/get-all-playlists").get(verifyJWT,getAllPlaylists);
router.route("/search-playlists/:search").get(verifyJWT,searchPlaylist);
router.route("/delete-playlist/:playlistId").delete(verifyJWT,deletePlaylist)
router.route("/:playlistId/videos/:videoId/").put(verifyJWT,addToPlaylist)

export default router;