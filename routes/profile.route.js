import { Router } from "express";
import { multerUpload } from "../config/cloudinaryConfig.js";
import { updateProfile } from "../controllers/profile.controller.js";

const profileRouter = Router();

profileRouter.put(
  "/profile/:id",
  multerUpload.single("photoUrl"),
  updateProfile
);
