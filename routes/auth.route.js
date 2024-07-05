import { Router } from "express";
import {
  fetchUser,
  logInUser,
  signOutUser,
  signUpUser,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signUpUser);
authRouter.post("/login", logInUser);
authRouter.get("/user", fetchUser);
authRouter.post("/signout", signOutUser);
authRouter.post("/refresh");

export default authRouter;
