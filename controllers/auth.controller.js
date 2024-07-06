import UserModel from "../models/users/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT } from "../utils/getJsonWebToken.js";

export const signUpUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) throw new Error("email is required!");
    if (!password) throw new Error("password is required!");

    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      return res.status(409).send({
        data: null,
        success: false,
        message: "Username already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const createdUser = await UserModel.create({
      email,
      password: hashPassword,
    });

    const { password: _, ...userWithoutPassword } = createdUser.toObject();

    if (createdUser) {
      res.status(201).send({
        message: "Register successful!",
        success: true,
        data: userWithoutPassword,
        accessToken: JWT.GetJWT({
          id: createdUser.id,
          username: createdUser.username,
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

    const { password: _, ...userWithoutPassword } = existingUser.toObject();

    res.status(200).send({
      message: "Login successful!",
      success: true,
      data: userWithoutPassword,
      accessToken: JWT.GetJWT({
        id: existingUser.id,
        username: existingUser.username,
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
