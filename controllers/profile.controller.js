import { uploadToCloudinary } from "../config/cloudinaryConfig.js";
import ProfileModel from "../models/profiles/profile.model.js";

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProfile = JSON.parse(req.body.updatedProfile);
    const file = req.file;

    const existingProfile = await ProfileModel.findOne({ userId: id });
    if (!existingProfile) {
      return res.status(404).send({
        message: "Profile not found",
        success: false,
        data: null,
      });
    }

    if (file) {
      const result = await uploadToCloudinary(file, "profile/avatar", id);
      updatedProfile.avatar = result.secure_url;
    }

    const updatedProfileDoc = await ProfileModel.findOneAndUpdate(
      { userId: id },
      { $set: updatedProfile },
      { new: true, upsert: false }
    );
    if (updatedProfileDoc) {
      res.send({
        message: "Profile updated successfully",
        success: true,
        data: updatedProfileDoc,
      });
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const fetchProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await ProfileModel.findOne({ userId: id });
    if (!profile) {
      return res.status(404).send({
        message: "Profile not found",
        success: false,
        data: null,
      });
    }
    res.status(200).send({
      message: "Profile fetched successfully",
      success: true,
      data: profile,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
