import dotenv from "dotenv";
import dbConnect from "./db/dbConfig.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

dbConnect().then(() => {
  console.log("Mongodb is connected successfully");
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
    
  });
}).catch(error,(err)=>{
 console.log(`Error occured during Mongodb Connection : ${err}`);
 
});
