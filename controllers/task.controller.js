import { uploadToCloudinary } from "../config/cloudinaryConfig.js";
import { TaskModel, TaskGroupModel } from "../models/tasks/task.model.js";

export const getAllTasks = async (req, res) => {
  try {
    const existingUser = req.user;
    const { projectId } = req.params;
    if (!projectId) {
      throw new Error("Missing required parameters");
    }

    return res.status(200).send({
      message: "Tasks fetched successfully",
      success: true,
      data: [],
      // department: existingDepartment,
      // project: existingProject,
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
    const { projectId } = req.params;
    const {
      taskName,
      description,
      taskGroup,
      assignedTo,
      priority,
      dueDate,
      attachments,
    } = req.body;
    console.log(existingUser, projectId, req.body);

    if (!projectId || !taskData) {
      throw new Error("Missing required parameters");
    }

    const newTask = await TaskModel.create({
      projectId,
      taskGroup,
      taskName,
      description,
      assignedBy: existingUser._id,
      assignedTo,
      status,
      priority,
      dueDate,
      completed,
      attachments,
    });

    return res.status(200).send({
      message: "Task created successfully",
      success: true,
      data: newTask,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
