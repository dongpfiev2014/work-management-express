import mongoose from "mongoose";
import Collections from "../../database/collection.js";
import ProjectSchema from "./project.schema.js";

const ProjectModel = mongoose.model(Collections.PROJECT, ProjectSchema);

export default ProjectModel;
