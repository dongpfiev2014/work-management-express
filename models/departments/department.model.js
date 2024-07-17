import mongoose from "mongoose";
import Collections from "../../database/collection.js";
import DepartmentSchema from "./department.schema.js";

const DepartmentModel = mongoose.model(
  Collections.DEPARTMENT,
  DepartmentSchema
);

export default DepartmentModel;
