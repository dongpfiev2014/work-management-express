import UserModel from "../models/users/user.model.js";
import bcrypt from "bcrypt";
import { JWT } from "../utils/getJsonWebToken.js";
import ProfileModel from "../models/profiles/profile.model.js";
import {
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/verifyJsonWebToken.js";
import SessionModel from "../models/sessions/session.model.js";
import Cookies from "cookies";

export const signUpUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName) throw new Error("Full Name is required!");
    if (!email) throw new Error("Email is required!");
    if (!password) throw new Error("Password is required!");

    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      return res.status(409).send({
        message: "Email already exists",
        success: false,
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const createdUser = await UserModel.create({
      email: email,
      password: hashPassword,
    });

    const createdProfile = await ProfileModel.create({
      fullName: fullName,
      email: email,
      userId: createdUser._id,
      userRole: createdUser.userRole,
    });

    if (createdUser) {
      res.status(201).send({
        message: "Register successful!",
        success: true,
        data: createdProfile,
        accessToken: JWT.GenerateAccessToken({
          id: createdUser.id,
          email: createdUser.email,
          tokenType: "AT",
        }),
      });
    }
  } catch (error) {
    res.status(500).send({
      data: null,
      success: false,
      message: error.message,
    });
  }
};

export const logInUser = async (req, res) => {
  try {
    const { email, password, geoLocationDetails } = req.body;
    if (!email) throw new Error("email is required!");
    if (!password) throw new Error("password is required!");
    if (!geoLocationDetails) {
      throw new Error("Geolocation details are required!");
    }

    const existingUser = await UserModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).send({
        data: null,
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).send({
        data: null,
        success: false,
        message: "Wrong email or password",
      });
    }
    const existingProfile = await ProfileModel.findOne({ email: email });
    const accessToken = JWT.GenerateAccessToken({
      id: existingUser.id,
      email: existingUser.email,
      tokenType: "AT",
    });
    const refreshToken = JWT.GenerateRefreshToken({
      id: existingUser.id,
      email: existingUser.email,
      tokenType: "RT",
    });

    //TODO Use bcrypt to hash the Refresh Token if you want it to be more secure
    const expiresInRefresh = parseInt(process.env.EXPIRES_IN_COOKIE, 10) * 1000;
    const expiresAt = new Date(Date.now() + expiresInRefresh);

    await SessionModel.create({
      userId: existingUser.id,
      email: existingUser.email,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
      ipDetails: geoLocationDetails,
    });

    // Check and remove oldest session
    const sessions = await SessionModel.find({
      userId: existingUser._id,
    })
      .sort({ createdAt: -1 })
      .skip(2);
    if (sessions.length > 0) {
      await SessionModel.deleteMany({
        _id: { $in: sessions.map((session) => session._id) },
      });
    }

    const cookies = new Cookies(req, res, {
      keys: [`${process.env.COOKIE_ENV}`],
    });

    cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresInRefresh,
      path: "/",
      signed: true,
    });

    res.status(200).send({
      message: "Login successful!",
      success: true,
      data: existingProfile,
      accessToken: accessToken,
    });
  } catch (error) {
    res.status(500).send({
      data: null,
      success: false,
      message: error.message,
    });
  }
};

export const fetchUser = async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    if (!accessToken) {
      res.status(401).send({
        message: "You are not authorized to access this route",
        success: false,
        data: null,
      });
    }
    const decodedToken = await verifyAccessToken(
      accessToken,
      process.env.JWT_ACCESS_SECRET_KEY
    );
    const existingProfile = await ProfileModel.findOne({
      userId: decodedToken.id,
    });

    if (!existingProfile) {
      return res.status(404).send({
        message: "User not found",
        success: false,
        data: null,
      });
    }
    res.status(200).send({
      message: "User fetched successfully",
      success: true,
      data: existingProfile,
    });
  } catch (error) {
    res.status(error.status || 500).send({
      message: error.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const signOutUser = async (req, res) => {
  try {
    const cookies = new Cookies(req, res, {
      keys: [`${process.env.COOKIE_ENV}`],
    });
    const refreshToken = cookies.get("refreshToken", { signed: true });
    if (!refreshToken) {
      return res.status(403).send({
        message: "No refresh token found",
        success: false,
      });
    }
    cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
      signed: true,
    });

    let decodedClientRT;
    //* Delete the invalid refresh token
    try {
      decodedClientRT = await verifyRefreshToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_KEY
      );
    } catch (error) {
      await SessionModel.findOneAndDelete({ userId: decodedClientRT.id });
      return res.status(401).send({
        message: "Invalid refresh token",
        success: false,
      });
    }

    await SessionModel.findOneAndDelete({ userId: decodedClientRT.id });

    res.status(200).send({
      message: "Logout successful",
      success: true,
      data: null,
    });
  } catch (error) {
    res.status(error.status || 500).send({
      message: error.message || "Internal Server Error",
      success: false,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const geoLocationDetails = req.body;
    const cookies = new Cookies(req, res, {
      keys: [`${process.env.COOKIE_ENV}`],
    });
    const refreshToken = cookies.get("refreshToken", { signed: true });
    if (!refreshToken) {
      return res.status(403).send({
        message: "No refresh token found",
        success: false,
      });
    }

    let decodedClientRT;
    //* Delete the invalid refresh token
    try {
      decodedClientRT = await verifyRefreshToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_KEY
      );
    } catch (error) {
      await SessionModel.updateOne(
        { "ipDetails.refreshToken": refreshToken },
        { $pull: { ipDetails: { refreshToken: refreshToken } } }
      );
      cookies.set("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
        signed: true,
      });
      return res.status(401).send({
        message: "Invalid refresh token",
        success: false,
      });
    }

    // * Update the refresh token in DB
    const existingSession = await SessionModel.findOne({
      refreshToken: refreshToken,
    });

    if (!existingSession) {
      return res.status(403).send({
        message: "Login session expired due to more than 2 devices logged in!",
        success: false,
      });
    }

    const newAccessToken = JWT.GenerateAccessToken({
      id: decodedClientRT.id,
      email: decodedClientRT.email,
      tokenType: "AT",
    });
    const expiresIn = decodedClientRT.exp - Math.floor(Date.now() / 1000);
    const newRefreshToken = JWT.GenerateRefreshToken({
      id: decodedClientRT.id,
      email: decodedClientRT.email,
      tokenType: "RT",
      expiresIn: `${expiresIn}s`,
    });

    cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresIn * 1000,
      path: "/",
      signed: true,
    });

    await SessionModel.findOneAndUpdate(
      { refreshToken: refreshToken },
      {
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        ipDetails: geoLocationDetails,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};
