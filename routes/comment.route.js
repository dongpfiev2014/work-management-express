import { Router } from "express";
import {
  addNewComment,
  fetchComments,
  likeComment,
} from "../controllers/comment.controller.js";

const commentRouter = Router();

commentRouter.post("/", addNewComment);
commentRouter.get("/:taskId", fetchComments);
commentRouter.patch("/:commentId/like", likeComment);

export default commentRouter;
