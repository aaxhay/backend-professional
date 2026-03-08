import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
const app = express();

app.use(express.json({}));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

//routes
import userRoute from "./routes/user.routes.js";
import videoRoute from "./routes/video.routes.js";
import playlistRoute from "./routes/playlist.routes.js"
app.use("/api/v1/users", userRoute);
app.use("/api/v1/videos", videoRoute);
app.use("/api/v1/playlists",playlistRoute)

export { app };
