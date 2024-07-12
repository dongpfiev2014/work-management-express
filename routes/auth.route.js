import { Router } from "express";
import {
  fetchUser,
  forgotPassword,
  logInUser,
  logInWithGoogle,
  refreshToken,
  resetPassword,
  signOutUser,
  signUpUser,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signUpUser);
authRouter.post("/logInWithGoogle", logInWithGoogle);
authRouter.post("/login", logInUser);
authRouter.get("/user", fetchUser);
authRouter.post("/signout", signOutUser);
authRouter.post("/refreshToken", refreshToken);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:resetId/:resetToken", resetPassword);

export default authRouter;
