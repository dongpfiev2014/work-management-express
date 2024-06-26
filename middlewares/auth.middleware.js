import UserModel from "../models/users/user.model.js";
import jwt from "jsonwebtoken";

export const verifyUserAuthorization = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).send({
        data: null,
        success: false,
        message: "You are not authorized to access this route",
      });
    } else {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const existingUser = await UserModel.findById(decodedToken._id);
      const checkRole = existingUser.role.includes("admin");
      if (!checkRole) {
        throw new Error("You are not authorized to access this route");
      }
      next();
    }
  } catch (error) {
    res.status(500).send({
      data: null,
      success: false,
      message: error.message,
    });
  }
};

export const verifyUserAuthentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).send({
        data: null,
        success: false,
        message: "You are not authorized to access this route",
      });
    } else {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const existingUser = await UserModel.findById(decodedToken._id);
      if (!existingUser) {
        throw new Error("Invalid user");
      }
      next();
    }
  } catch (error) {
    res.status(500).send({
      data: null,
      success: false,
      message: error.message,
    });
  }
};
