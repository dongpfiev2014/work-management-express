import CommentModel from "../models/comments/comment.model.js";
import { TaskModel } from "../models/tasks/task.model.js";

export const addNewComment = async (req, res) => {
  try {
    const { text, taskId, author } = req.body;
    if (!text || !taskId || !author) {
      return res.status(400).send({
        message: "Text, taskId, and author are required",
        success: false,
        data: null,
      });
    }
    const newComment = new CommentModel({
      text,
      taskId,
      author,
    });

    // Save the new comment to the database
    const savedComment = await newComment.save();

    // Update the task with the new comment
    await TaskModel.findByIdAndUpdate(taskId, {
      $push: { comments: savedComment._id },
    });

    res.status(201).send({
      message: "Comment added successfully",
      success: true,
      data: savedComment,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const fetchComments = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    if (!taskId) {
      return res.status(400).send({
        message: "taskId is required",
        success: false,
        data: null,
      });
    }
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).send({
        message: "Task not found",
        success: false,
        data: null,
      });
    }
    const comments = await CommentModel.find({ taskId }).populate("author");
    res.status(200).send({
      message: "Comments fetched successfully",
      success: true,
      data: comments,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
