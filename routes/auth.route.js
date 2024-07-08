import { Router } from "express";
import {
  fetchUser,
  logInUser,
  refreshToken,
  signOutUser,
  signUpUser,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signUpUser);
authRouter.post("/login", logInUser);
authRouter.get("/user", fetchUser);
authRouter.post("/signout", signOutUser);
authRouter.post("/refreshToken", refreshToken);

export default authRouter;
