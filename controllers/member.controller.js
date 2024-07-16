import mongoose from "mongoose";
import CompanyModel from "../models/companies/company.model.js";
import ProfileModel from "../models/profiles/profile.model.js";

export const getAllMembers = async (req, res) => {
  try {
    const { organizationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).send({
        message: "Invalid company ID",
        success: false,
        data: null,
      });
    }

    const members = await CompanyModel.findById(organizationId).exec();
    if (!members) {
      return res.status(404).send({
        message: "Company not found",
        success: false,
        data: null,
      });
    }
    const profiles = await ProfileModel.find({
      userId: {
        $in: members.employees,
      },
    }).exec();

    res.status(200).send({
      message: "Company employees retrieved successfully",
      success: true,
      data: profiles,
    });
  } catch (err) {
    res.status(err.status || 500).send({
      message: err.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
