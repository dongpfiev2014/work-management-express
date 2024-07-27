import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/", getAllUsers); //domain :/users/
userRouter.get("/:userId", getUserById);

export default userRouter;
