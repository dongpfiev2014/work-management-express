import { Router } from "express";
import { multerUpload } from "../config/cloudinaryConfig.js";
import {
  fetchProfile,
  updateProfile,
} from "../controllers/profile.controller.js";

const profileRouter = Router();

profileRouter.put("/:id", multerUpload.single("avatar"), updateProfile);
profileRouter.get("/:id", fetchProfile);

export default profileRouter;
