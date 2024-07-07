import UserModel from "../models/users/user.model.js";
import { verifyAccessToken } from "../utils/verifyJsonWebToken.js";

export const verifyUserAuthentication = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).send({
        data: null,
        success: false,
        message: "You are not authorized to access this route",
      });
    }
    const decodedToken = await verifyAccessToken(
      token,
      process.env.JWT_ACCESS_SECRET_KEY
    );
    const existingUser = await UserModel.findById(decodedToken.id);
    if (!existingUser) {
      return res.status(404).send({
        data: null,
        success: false,
        message: "User not found",
      });
    }
    req.user = existingUser;
    next();
  } catch (error) {
    res.status(error.status || 500).send({
      data: null,
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const verifyUserAuthorization = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).send({
        data: null,
        success: false,
        message: "You are not authorized to access this route",
      });
    }
    const decodedToken = await verifyAccessToken(
      token,
      process.env.JWT_ACCESS_SECRET_KEY
    );

    const existingUser = await UserModel.findById(decodedToken._id);
    if (!existingUser) {
      return res.status(404).send({
        data: null,
        success: false,
        message: "Invalid user",
      });
    }

    const isAdmin = existingUser.role.includes("admin");
    if (!isAdmin) {
      return res.status(403).send({
        data: null,
        success: false,
        message: "You are not authorized to access this route",
      });
    }
    req.user = existingUser;
    next();
  } catch (error) {
    res.status(error.status || 500).send({
      message: error.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
