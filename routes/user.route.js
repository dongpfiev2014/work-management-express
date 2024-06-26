import { Router } from "express";
import {
  changePassword,
  getAllUsers,
  getUserById,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/", getAllUsers); //domain :/users/
userRouter.get("/:userId", getUserById);
userRouter.put("/:userId", changePassword);

export default userRouter;
