import { Router } from "express";
import {
  createProject,
  fetchProjects,
  getMembers,
} from "../controllers/project.controller.js";
import { multerUpload } from "../config/cloudinaryConfig.js";

const projectRouter = Router();

projectRouter.post(
  "/:departmentId/:userId",
  multerUpload.single("projectImage"),
  createProject
);
projectRouter.get("/:departmentId", fetchProjects);
projectRouter.get("/author/:departmentId", getMembers);

export default projectRouter;
