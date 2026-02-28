import dotenv from "dotenv";
import dbConnect from "./db/dbConfig.js";

dotenv.config({
    path : "./.env"
})

dbConnect()