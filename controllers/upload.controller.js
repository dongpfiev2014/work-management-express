import { uploadToCloudinary } from "../config/cloudinaryConfig.js";

export const uploadFile = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send({
      message: "File not found",
      success: false,
      data: null,
    });
  }
  try {
    const result = await uploadToCloudinary(file, "images");
    res.status(200).send({
      message: "Uploaded successfully",
      success: true,
      dataUrl: result.secure_url,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error uploading",
      success: false,
      data: null,
    });
  }
};
