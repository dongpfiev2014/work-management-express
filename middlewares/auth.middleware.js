import UserModel from "../models/users/user.model.js";
import { verifyAccessToken } from "../utils/verifyJsonWebToken.js";
import Cookies from "cookies";

export const verifyUserAuthentication = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send({
        data: null,
        success: false,
        message: "You are not authorized to access this route",
      });
    }

    const cookies = new Cookies(req, res, {
      keys: [`${process.env.COOKIE_ENV}`],
      secure: process.env.NODE_ENV === "production" ? true : false,
    });
    const refreshToken = cookies.get("refreshToken", { signed: true });
    if (!refreshToken) {
      return res.status(403).send({
        message: "No refresh token found",
        success: false,
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
    console.log(error);
    if (!res.headersSent) {
      return res.status(error.status || 500).send({
        data: null,
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
};

export const verifyUserAuthorization = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send({
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
    return res.status(error.status || 500).send({
      message: error.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const checkOwnership = (req, res, next) => {
  if (req.user._id.toString() === req.params.userId) {
    next();
  } else {
    res.status(403).send({
      message: "You are not authorized to perform this action",
      success: false,
      data: null,
    });
  }
};
