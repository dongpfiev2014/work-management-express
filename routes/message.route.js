import { Router } from "express";
import { sendMessagePortfolio } from "../controllers/message.controller.js";

const messageRouter = Router();

messageRouter.post("/portfolio", sendMessagePortfolio);

export default messageRouter;
