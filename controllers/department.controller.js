import mongoose from "mongoose";
import UserModel from "../models/users/user.model.js";
import DepartmentModel from "../models/departments/department.model.js";
// Import your user model

const getEmailObjectIds = async (emails) => {
  if (!Array.isArray(emails)) {
    throw new Error("Emails must be an array");
  }
  const emailObjectIds = [];

  for (const email of emails) {
    const user = await UserModel.findOne({ email }).exec();
    if (user) {
      emailObjectIds.push(user._id); // Assuming _id is ObjectId
    } else {
      console.warn(`User with email ${email} not found.`);
      // Handle case where user with email is not found
    }
  }
  return emailObjectIds;
};

export const createDepartment = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { newOwners, newMemberAccesses, name, description } = req.body;
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).send({
        message: "Invalid company ID",
        success: false,
        data: null,
      });
    }

    const ownersObjectIds = await getEmailObjectIds(newOwners);
    const memberAccessesObjectIds = await getEmailObjectIds(newMemberAccesses);

    if (!ownersObjectIds.length || !memberAccessesObjectIds.length) {
      return res.status(400).send({
        message: "Invalid owners or member accesses emails",
        success: false,
        data: null,
      });
    }
    const newDepartment = new DepartmentModel({
      departmentName: name,
      organizationId: organizationId,
      owners: ownersObjectIds,
      memberAccesses: memberAccessesObjectIds,
      description: description || "",
      projects: [],
      // Add other fields like organizationId, projects if required
    });

    // Save the department to the database
    await newDepartment.save();

    return res.status(200).send({
      message: "Department created successfully",
      success: true,
      data: newDepartment,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const getAllDepartments = async (req, res) => {
  try {
    const { organizationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).send({
        message: "Invalid company ID",
        success: false,
        data: null,
      });
    }
    const departments = await DepartmentModel.find({
      organizationId: organizationId,
    }).exec();
    return res.status(200).send({
      message: "Departments fetched successfully",
      success: true,
      data: departments,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
