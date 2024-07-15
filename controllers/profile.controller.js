export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProfile = JSON.parse(req.body.updatedProfile);
    const file = req.file;
    console.log(id, updatedProfile, file);

    // Update the profile with the provided data and file if present
  } catch (err) {
    res.status(error.status || 500).send({
      message: error.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
