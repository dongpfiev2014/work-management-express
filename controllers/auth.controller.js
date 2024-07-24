import UserModel from "../models/users/user.model.js";
import bcrypt from "bcrypt";
import { JWT } from "../utils/getJsonWebToken.js";
import ProfileModel from "../models/profiles/profile.model.js";
import {
  verifyAccessToken,
  verifyRefreshToken,
  verifyResetToken,
} from "../utils/verifyJsonWebToken.js";
import SessionModel from "../models/sessions/session.model.js";
import Cookies from "cookies";
import generateStrongPassword from "../utils/generatePassword.js";
import nodemailer from "nodemailer";

export const signUpUser = async (req, res) => {
  try {
    const { fullName, email, password, emailVerified, geoLocationDetails } =
      req.body;
    if (!fullName) throw new Error("Full Name is required!");
    if (!email) throw new Error("Email is required!");
    if (!password) throw new Error("Password is required!");
    if (!geoLocationDetails) {
      throw new Error("Geolocation details are required!");
    }

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
      emailVerified: emailVerified,
    });

    const accessToken = JWT.GenerateAccessToken({
      id: createdUser.id,
      email: createdUser.email,
      tokenType: "AT",
    });
    const refreshToken = JWT.GenerateRefreshToken({
      id: createdUser.id,
      email: createdUser.email,
      tokenType: "RT",
    });

    //TODO Use bcrypt to hash the Refresh Token if you want it to be more secure
    const expiresInRefresh = parseInt(process.env.EXPIRES_IN_COOKIE, 10) * 1000;
    const expiresAt = new Date(Date.now() + expiresInRefresh);

    await SessionModel.create({
      userId: createdUser.id,
      email: createdUser.email,
      refreshToken: refreshToken,
      expiresAt: expiresAt,
      ipDetails: geoLocationDetails,
    });

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
      data: createdProfile,
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

export const logInWithGoogle = async (req, res) => {
  try {
    const { userInfo, geoLocationDetails } = req.body;
    if (!userInfo) throw new Error("No User Information");
    if (!geoLocationDetails) {
      throw new Error("Geolocation details are required!");
    }
    if (!userInfo.emailVerified) {
      return res.status(403).send({
        data: null,
        success: false,
        message: "Email is not verified",
      });
    }

    let existingUser;
    existingUser = await UserModel.findOneAndUpdate(
      { email: userInfo.email },
      {
        $set: {
          providerId: userInfo.providerData[0].providerId,
        },
      },
      { new: true }
    );
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const randomPassword = generateStrongPassword();
      const hashPassword = await bcrypt.hash(randomPassword, salt);
      existingUser = await UserModel.create({
        email: userInfo.email,
        password: hashPassword,
        providerId: userInfo.providerData[0].providerId,
      });
    }
    const existingProfile = await ProfileModel.findOne({
      email: userInfo.email,
    });
    if (!existingProfile) {
      await ProfileModel.create({
        email: userInfo.email,
        userId: existingUser._id,
        userRole: existingUser.userRole,
        fullName: userInfo.displayName,
        emailVerified: userInfo.emailVerified,
        avatar: userInfo.photoURL,
      });
    }

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
      message: error.message,
      success: false,
      data: null,
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
      return res.status(400).send({
        data: null,
        success: false,
        message: "Wrong email or password",
      });
    }
    const existingProfile = await ProfileModel.findOne({ email: email });
    if (!existingProfile.emailVerified) {
      return res.status(403).send({
        data: null,
        success: false,
        message: "Email is not verified",
      });
    }

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
    res.status(error.status || 500).send({
      data: null,
      success: false,
      message: error.message || "Internal Server Error",
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
      return res.status(401).send({
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
    //* You should update the expiresIn time of accessToken in the rest of RefreshToken if refreshToken is about to expire
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await ProfileModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    const resetToken = JWT.GenerateResetToken({
      id: existingUser.userId,
      email: existingUser.email,
      tokenType: "RES",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.GMAIL_ID}`,
        pass: `${process.env.GMAIL_APP_PASSWORD}`,
      },
    });

    const mailOptions = {
      from: `Work Management Team <noreply@workmanagement.com>`,
      to: `${existingUser.email}`,
      subject: "Reset Password Request",
      html: `
      <p>Dear ${existingUser.fullName},</p><br>
      <p>You have requested to reset your password.</p>
      <p>Please click the following link to reset your password:</p><br>
      <p><a href="http://localhost:3000/reset-password/${existingUser.userId}/${resetToken}">Reset Password</a></p><br>
      <p>If you did not request this, please ignore this email.</p>
      <p>Thank you!</p>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // console.log("Error sending email:", error);
        throw new Error("Failed to send reset password email");
      } else {
        // console.log("Reset email sent:", info.response);
        res.status(200).send({
          message: `Reset password link sent to your email: ${existingUser.email}`,
          success: true,
        });
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Internal Server Error",
      success: false,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetId, resetToken } = req.params;
    const { password } = req.body;
    if (!password) throw new Error(`Invalid password`);
    const decodedResetToken = await verifyResetToken(
      resetToken,
      process.env.JWT_RESET_SECRET_KEY
    );

    if (!decodedResetToken || resetId !== decodedResetToken.id) {
      return res.status(401).send({
        message: "The user not found or the authenticated session has expired",
        success: false,
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const existingUser = await UserModel.findByIdAndUpdate(
      resetId,
      { password: hashPassword },
      { new: true }
    );

    if (existingUser) {
      return res.status(200).send({
        message: "Password reset successful",
        success: true,
      });
    } else {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }
  } catch (error) {
    res.status(error.status || 500).send({
      message: error.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
