import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import CommentModel from "../models/comments/comment.model.js";
import { TaskModel } from "../models/tasks/task.model.js";

export const addNewComment = async (req, res) => {
  try {
    const existingUser = req.user;
    const { text, taskId } = req.body;

    if (!text || !taskId || !existingUser) {
      return res.status(400).send({
        message: "Text, taskId, and author are required",
        success: false,
        data: null,
      });
    }
    const newComment = new CommentModel({
      text,
      taskId,
      author: existingUser._id,
    });

    // Save the new comment to the database
    const savedComment = await newComment.save();
    const returnComment = await CommentModel.aggregate([
      {
        $match: { _id: savedComment._id },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "author",
          foreignField: "userId",
          as: "authorInfo",
        },
      },
      {
        $unwind: "$authorInfo",
      },
      {
        $project: {
          _id: 1,
          taskId: 1,
          text: 1,
          likes: 1,
          createdAt: 1,
          updatedAt: 1,
          author: {
            _id: "$authorInfo.userId",
            fullName: "$authorInfo.fullName",
            avatar: "$authorInfo.avatar",
          },
        },
      },
    ]);

    // Update the task with the new comment
    await TaskModel.findByIdAndUpdate(taskId, {
      $push: { comments: savedComment._id },
    });

    return res.status(200).send({
      message: "Comment added successfully",
      success: true,
      data: returnComment[0],
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
    const { taskId } = req.params;
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

    const comments = await CommentModel.aggregate([
      {
        $match: { taskId: new ObjectId(taskId) },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "author",
          foreignField: "userId",
          as: "authorInfo",
        },
      },
      {
        $unwind: "$authorInfo",
      },
      {
        $project: {
          _id: 1,
          taskId: 1,
          text: 1,
          likes: 1,
          createdAt: 1,
          updatedAt: 1,
          author: {
            _id: "$authorInfo.userId",
            fullName: "$authorInfo.fullName",
            avatar: "$authorInfo.avatar",
          },
        },
      },
    ]);

    return res.status(200).send({
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

export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId) {
      return res.status(400).send({
        message: "commentId is required",
        success: false,
        data: null,
      });
    }
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).send({
        message: "Comment not found",
        success: false,
        data: null,
      });
    }
    comment.likes += 1;

    // Save the updated comment back to the database
    await comment.save();

    return res.status(200).send({
      message: "Like added successfully",
      success: true,
      data: null,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
