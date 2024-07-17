import { Router } from "express";
import {
  createDepartment,
  getAllDepartments,
} from "../controllers/department.controller.js";

const departmentRouter = Router();

departmentRouter.get("/:organizationId", getAllDepartments);
departmentRouter.post("/:organizationId", createDepartment);

export default departmentRouter;
