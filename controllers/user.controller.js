import UsersModel from "../models/users/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await UsersModel.find();
    if (allUsers) {
      res.status(200).send({
        message: "All users have found successfully",
        total: allUsers.length,
        users: allUsers,
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

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const existingUser = await UsersModel.findById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }
    res.status(200).send({
      message: "successfully",
      user: existingUser,
    });
  } catch (error) {
    res.status(500).send({
      data: null,
      success: false,
      message: error.message,
    });
  }
};
