import { uploadToCloudinary } from "../config/cloudinaryConfig.js";
import DepartmentModel from "../models/departments/department.model.js";
import ProfileModel from "../models/profiles/profile.model.js";
import ProjectModel from "../models/projects/project.model.js";
import { TaskModel, TaskGroupModel } from "../models/tasks/task.model.js";
import UserModel from "../models/users/user.model.js";

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

export const fetchAllTasks = async (req, res) => {
  try {
    const { projectId, departmentId } = req.params;

    if (!projectId || !departmentId) {
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
    const existingProject = await ProjectModel.findById(projectId);
    if (!existingProject) {
      return res.status(404).send({
        message: "Project not found",
        success: false,
        data: null,
      });
    }

    const taskGroups = await TaskGroupModel.find({
      projectId,
    }).exec();

    const groupNames = taskGroups.map((group) => group.groupName);

    const tasks = await TaskModel.aggregate([
      { $match: { taskGroup: { $in: groupNames } } },
      {
        $lookup: {
          from: "profiles",
          localField: "assignedBy",
          foreignField: "userId",
          as: "assignedByProfile",
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "assignedTo",
          foreignField: "userId",
          as: "assignedToProfiles",
        },
      },
      {
        $addFields: {
          assignedByProfile: {
            $arrayElemAt: ["$assignedByProfile", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          projectId: 1,
          taskGroup: 1,
          taskName: 1,
          description: 1,
          dueDate: 1,
          status: 1,
          priority: 1,
          completed: 1,
          attachments: 1,
          assignedBy: "$assignedByProfile",
          assignedTo: "$assignedToProfiles",
        },
      },
    ]);

    const responseTaskGroups = taskGroups.map((group) => {
      const groupTasks = tasks
        .filter((task) => task.taskGroup === group.groupName)
        .map((task) => ({
          _id: task._id,
          projectId: task.projectId,
          taskGroup: task.taskGroup,
          taskName: task.taskName,
          description: task.description,
          dueDate: task.dueDate,
          assignedBy: task.assignedBy,
          assignedTo: task.assignedTo,
          status: task.status,
          priority: task.priority,
          completed: task.completed,
          attachments: task.attachments,
        }));

      return {
        groupName: group.groupName,
        description: group.description || group.groupName,
        tasks: groupTasks,
      };
    });

    return res.status(200).send({
      message: "Tasks fetched successfully",
      success: true,
      data: responseTaskGroups,
      department: existingDepartment,
      project: existingProject,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const createTaskGroup = async (req, res) => {
  try {
    const { projectId } = req.params;
    const taskGroupData = req.body;

    if (!projectId || taskGroupData === undefined || taskGroupData === null) {
      throw new Error("Missing required parameters");
    }

    const newTaskGroup = await TaskGroupModel.create({
      projectId,
      ...taskGroupData,
    });

    if (newTaskGroup) {
      return res.status(200).send({
        message: "Task Group created successfully",
        success: true,
        data: newTaskGroup,
      });
    }
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const existingUser = req.user;
    const { departmentId, projectId } = req.params;
    const taskData = req.body;
    const {
      taskName,
      description,
      taskGroup,
      assignedTo,
      priority,
      dueDate,
      attachments,
    } = taskData;

    if (!projectId || taskData === undefined || taskData === null) {
      throw new Error("Missing required parameters");
    }

    const assignedToObjectId = await getEmailObjectIds(assignedTo);

    const newTask = await TaskModel.create({
      projectId,
      departmentId,
      taskGroup,
      taskName,
      description,
      assignedBy: existingUser._id,
      assignedTo: assignedToObjectId,
      priority,
      dueDate,
      attachments,
    });

    const assignedByProfile = await ProfileModel.findOne({
      userId: existingUser._id,
    });
    const assignedToProfile = await ProfileModel.find({
      userId: { $in: assignedToObjectId },
    });

    const responseTask = {
      ...newTask.toObject(),
      assignedBy: assignedByProfile,
      assignedTo: assignedToProfile,
    };

    return res.status(200).send({
      message: "Task created successfully",
      success: true,
      data: responseTask,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const personalTasks = async (req, res) => {
  try {
    const existingUser = req.user;
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const tasks = await TaskModel.aggregate([
      { $match: { assignedTo: existingUser._id } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "profiles",
          localField: "assignedBy",
          foreignField: "userId",
          as: "assignedByProfile",
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "assignedTo",
          foreignField: "userId",
          as: "assignedToProfiles",
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "projectInfo",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $addFields: {
          assignedByProfile: {
            $arrayElemAt: ["$assignedByProfile", 0],
          },
          projectInfo: {
            $arrayElemAt: ["$projectInfo", 0],
          },
          departmentInfo: {
            $arrayElemAt: ["$departmentInfo", 0],
          },
        },
      },
      {
        $project: {
          _id: 1,
          projectId: "$projectInfo",
          departmentId: "$departmentInfo",
          taskGroup: 1,
          taskName: 1,
          description: 1,
          dueDate: 1,
          status: 1,
          priority: 1,
          completed: 1,
          attachments: 1,
          assignedBy: "$assignedByProfile",
          assignedTo: "$assignedToProfiles",
        },
      },
    ]);

    const columns = {
      column1: {
        name: "TO DO",
        color: "#108ee9",
        items: [],
      },
      column2: {
        name: "WORK IN PROGRESS",
        color: "#f50",
        items: [],
      },
      column3: {
        name: "UNDER REVIEW",
        color: "#2db7f5",
        items: [],
      },
      column4: {
        name: "COMPLETED",
        color: "#87d068",
        items: [],
      },
    };

    tasks.forEach((task) => {
      // Tạo một object chứa thông tin task
      const taskItem = {
        id: task._id,
        projectId: task.projectId,
        department: task.departmentId,
        taskGroup: task.taskGroup,
        title: task.taskName,
        content: task.description,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        completed: task.completed,
        attachments: task.attachments,
        assignedBy: task.assignedBy,
        followers: task.assignedTo,
      };

      // Sắp xếp task vào cột tương ứng
      const columnKey = `column${
        ["TO DO", "WORK IN PROGRESS", "UNDER REVIEW", "COMPLETED"].indexOf(
          task.status
        ) + 1
      }`;
      if (columns[columnKey]) {
        columns[columnKey].items.push(taskItem);
      }
    });

    return res.status(200).send({
      message: "Personal Tasks fetched successfully",
      success: true,
      data: columns,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const updatePersonalTasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const newStatus = req.body.status;

    if (!taskId || !newStatus) {
      return res.status(400).send({
        message: "Task ID and new status are required",
        success: false,
      });
    }

    const statusMap = {
      column1: "TO DO",
      column2: "WORK IN PROGRESS",
      column3: "UNDER REVIEW",
      column4: "COMPLETED",
    };

    const actualStatus = statusMap[newStatus];

    if (!actualStatus) {
      return res.status(400).send({
        message: "Invalid status provided",
        success: false,
      });
    }

    const task = await TaskModel.findByIdAndUpdate(
      taskId,
      { status: actualStatus },
      { new: true }
    )
      .populate("assignedBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("projectId", "projectName")
      .populate("departmentId", "departmentName");

    if (!task) {
      return res.status(404).send({
        message: "Task not found",
        success: false,
      });
    }

    return res.status(200).send({
      message: "Task updated successfully",
      success: true,
      data: task,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
    });
  }
};

export const updateStatusTasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const newStatus = req.body.status;

    if (!taskId || !newStatus) {
      return res.status(400).send({
        message: "Task ID and new status are required",
        success: false,
      });
    }

    const task = await TaskModel.findByIdAndUpdate(
      taskId,
      { status: newStatus },
      { new: true }
    )
      .populate("assignedBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("projectId", "projectName")
      .populate("departmentId", "departmentName");

    if (!task) {
      return res.status(404).send({
        message: "Task not found",
        success: false,
      });
    }

    return res.status(200).send({
      message: "Task updated successfully",
      success: true,
      data: task,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
    });
  }
};
