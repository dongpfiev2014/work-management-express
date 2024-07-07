import UserModel from "../models/users/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT } from "../utils/getJsonWebToken.js";
import ProfileModel from "../models/profiles/profile.model.js";

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
      roles: "user",
    });

    const createdProfile = await ProfileModel.create({
      fullName: fullName,
      email: email,
      userId: createdUser._id,
    });

    if (createdUser) {
      res.status(201).send({
        message: "Register successful!",
        success: true,
        data: createdProfile,
        accessToken: JWT.GetJWT({
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
    const { email, password } = req.body;
    if (!email) throw new Error("email is required!");
    if (!password) throw new Error("password is required!");

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

    res.status(200).send({
      message: "Login successful!",
      success: true,
      data: existingProfile,
      accessToken: JWT.GetJWT({
        id: existingUser.id,
        email: existingUser.email,
        tokenType: "AT",
      }),
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
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(401).send({
        message: "You are not authorized to access this route",
        success: false,
        data: null,
      });
    }
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
      const existingUser = await UserModel.findById(decodedToken.id).select(
        "-password"
      );
      if (!existingUser) {
        return res.status(404).send({
          message: "User not found",
          success: false,
          data: null,
        });
      }
      res.status(200).send({
        message: "User fetched successfully",
        success: true,
        data: existingUser,
      });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).send({
          message: "Invalid token",
          success: false,
          data: null,
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).send({
          message: "Token expired",
          success: false,
          data: null,
        });
      }
      // Handle other JWT errors or general server errors
      console.error(error);
      res.status(500).send({
        message: "Internal server error",
        success: false,
        data: null,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
      data: null,
    });
  }
};

export const signOutUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send({
        message: "You are not authorized to access this route",
        success: false,
      });
    }
    // await TokenModel.findOneAndDelete({ token });

    res.status(200).send({
      message: "Logout successful",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};
