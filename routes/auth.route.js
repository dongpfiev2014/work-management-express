import { Router } from "express";
import { logInUser, signUpUser } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signUpUser);
authRouter.post("/login", logInUser);
authRouter.post("/signout");
authRouter.post("/refresh");

export default authRouter;
