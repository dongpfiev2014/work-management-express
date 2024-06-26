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

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    const currentUser = await UsersModel.findById(userId);
    if (!currentUser) throw new Error("User is not exists!");
    currentUser.password = password;
    await currentUser.save();
    res.status(201).send({
      message: "Updated password!",
      success: true,
      data: currentUser,
    });
  } catch (error) {
    res.status(403).send({
      message: error.message,
      data: null,
      success: false,
    });
  }
};

export const getAdminPage = async (req, res) => {
  res.status(200).send({
    message: "Admin page",
    success: true,
  });
};
