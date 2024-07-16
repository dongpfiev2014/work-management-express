import { Router } from "express";
import { requestApproved } from "../controllers/request.controller.js";

const requestRouter = Router();

requestRouter.post("/request-approved", requestApproved);

export default requestRouter;
