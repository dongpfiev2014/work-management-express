export const getAllTasks = async (req, res) => {
  try {
    const existingUser = req.user;
    const { departmentId, projectId } = req.params;
    const taskData = JSON.parse(req.body.taskData);
    const file = req.file;
    if (!departmentId || !projectId || existingUser) {
      throw new Error("Missing required parameters");
    }

    return res.status(200).send({
      message: "Tasks fetched successfully",
      success: true,
      data: fetchedProjects,
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
