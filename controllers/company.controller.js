import { uploadToCloudinary } from "../config/cloudinaryConfig.js";
import CompanyModel from "../models/companies/company.model.js";
import DepartmentModel from "../models/departments/department.model.js";
import ProfileModel from "../models/profiles/profile.model.js";

export const createCompany = async (req, res) => {
  try {
    const { userId } = req.params;
    const newCompanyData = JSON.parse(req.body.newCompanyData);
    const file = req.file;
    if (!userId || !newCompanyData) {
      throw new Error("Missing required parameters");
    }
    const existingProfile = await ProfileModel.findOne({ userId: userId });
    if (!existingProfile) {
      return res.status(404).send({
        message: "Profile not found",
        success: false,
        data: null,
      });
    }
    const createdCompany = await CompanyModel.create({
      owner: userId,
      ...newCompanyData,
    });
    if (file) {
      const result = await uploadToCloudinary(
        file,
        "companies/logo",
        createdCompany._id
      );
      createdCompany.companyLogo = result.secure_url;
      await createdCompany.save();
    }
    existingProfile.companies.push(createdCompany._id);
    existingProfile.role.push("owner");
    await existingProfile.save();

    return res.status(201).send({
      message: "Company created successfully",
      success: true,
      data: createdCompany,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};

export const fetchCompanies = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new Error("Missing required parameters");
    }

    const companies = await CompanyModel.find({
      $or: [{ owner: userId }, { employees: { $in: [userId] } }],
    });

    const allDepartments = await DepartmentModel.find({
      organizationId: companies[0]._id,
    });
    companies[0].department = allDepartments;

    return res.status(200).send({
      message: "Companies fetched successfully",
      success: true,
      data: companies,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
