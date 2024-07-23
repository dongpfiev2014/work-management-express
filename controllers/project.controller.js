import { uploadToCloudinary } from "../config/cloudinaryConfig.js";
import DepartmentModel from "../models/departments/department.model.js";
import ProfileModel from "../models/profiles/profile.model.js";
import ProjectModel from "../models/projects/project.model.js";

export const createProject = async (req, res) => {
  try {
    const { departmentId, userId } = req.params;
    const projectData = JSON.parse(req.body.projectData);
    const file = req.file;

    if (!departmentId || !projectData || !userId) {
      throw new Error("Missing required parameters");
    }
    const existingDepartment = await DepartmentModel.findById(departmentId);
    if (!existingDepartment) {
      return res.status(404).send({
        message: "Department not found",
        success: false,
        data: null,
      });
    }
    const createdProject = new ProjectModel({
      ...projectData,
      owner: userId,
      departmentId: existingDepartment._id,
      organizationId: existingDepartment.organizationId,
    });

    if (file) {
      const result = await uploadToCloudinary(
        file,
        "projects/images",
        createdProject._id
      );
      createdProject.projectImage = result.secure_url;
    }
    await createdProject.save();

    existingDepartment.projects.push(createdProject._id);
    await existingDepartment.save();

    const populatedProject = await ProjectModel.findById(
      createdProject._id
    ).populate("owner");

    return res.status(200).send({
      message: "Project created successfully",
      success: true,
      data: populatedProject,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const fetchProjects = async (req, res) => {
  try {
    const { departmentId } = req.params;
    if (!departmentId) {
      throw new Error("Missing required parameters");
    }
    const existingDepartment = await DepartmentModel.findById(departmentId);
    if (!existingDepartment) {
      return res.status(404).send({
        message: "Department not found",
        success: false,
        data: null,
      });
    }
    const fetchedProjects2 = await ProjectModel.find({
      departmentId: existingDepartment._id,
    })
      .populate("owner")
      .exec();

    // const fetchedProjects = await ProjectModel.aggregate([
    //   {
    //     $match: { departmentId: existingDepartment._id },
    //   },
    //   {
    //     $lookup: {
    //       from: "profiles",
    //       localField: "owner",
    //       foreignField: "userId",
    //       as: "ownerProfile",
    //     },
    //   },
    //   {
    //     $unwind: "$ownerProfile",
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       projectName: 1,
    //       description: 1,
    //       departmentId: 1,
    //       organizationId: 1,
    //       projectImage: 1,
    //       owner: {
    //         _id: "$ownerProfile._id",
    //         fullName: "$ownerProfile.fullName",
    //         email: "$ownerProfile.email",
    //         avatar: "$ownerProfile.avatar",
    //       },
    //     },
    //   },
    // ]);

    return res.status(200).send({
      message: "Projects fetched successfully",
      success: true,
      data: fetchedProjects2,
      department: existingDepartment,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const getMembers = async (req, res) => {
  try {
    const { departmentId } = req.params;
    if (!departmentId) {
      throw new Error("Missing required parameters");
    }
    const existingDepartment = await DepartmentModel.findById(
      departmentId
    ).exec();
    if (!existingDepartment) {
      return res.status(404).send({
        message: "Department not found",
        success: false,
        data: null,
      });
    }

    const fetchedMembers = await ProfileModel.find({
      userId: {
        $in: [
          ...existingDepartment.owners,
          ...existingDepartment.memberAccesses,
        ],
      },
    }).exec();

    return res.status(200).send({
      message: "Members fetched successfully",
      success: true,
      data: fetchedMembers,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
