import { Router } from "express";
import { getAllMembers } from "../controllers/member.controller.js";

const memberRouter = Router();

memberRouter.get("/:organizationId", getAllMembers);

export default memberRouter;
