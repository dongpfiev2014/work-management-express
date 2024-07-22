import { Router } from "express";
import { addNewComment } from "../controllers/comment.controller.js";

const commentRouter = Router();

commentRouter.post("/", addNewComment);

export default commentRouter;
