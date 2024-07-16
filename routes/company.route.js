import { Router } from "express";
import { multerUpload } from "../config/cloudinaryConfig.js";
import {
  createCompany,
  fetchCompanies,
} from "../controllers/company.controller.js";

const companyRouter = Router();

companyRouter.post(
  "/:userId",
  multerUpload.single("companyLogo"),
  createCompany
);
companyRouter.get("/:userId", fetchCompanies);

export default companyRouter;
