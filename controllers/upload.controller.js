import {
  uploadMultiTypeToCloudinary,
  uploadToCloudinary,
} from "../config/cloudinaryConfig.js";

export const uploadMultipleTaskFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const files = req.files;
    const fileUrls = [];

    if (!files || files.length === 0) {
      return res.status(400).send({
        message: "Files not found",
        success: false,
        data: null,
      });
    }

    for (const file of files) {
      const result = await uploadMultiTypeToCloudinary(
        file,
        "tasks/files",
        projectId
      );
      fileUrls.push(result.secure_url);
    }
    return res.status(200).send({
      message: "Files uploaded successfully",
      success: true,
      data: fileUrls,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
