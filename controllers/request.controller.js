import mongoose from "mongoose";
import CompanyModel from "../models/companies/company.model.js";
import ProfileModel from "../models/profiles/profile.model.js";

export const requestApproved = async (req, res) => {
  const MAX_RETRIES = 3;
  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const data = req.body;
      if (!data) throw new Error("Invalid data");

      const existingProfile = await ProfileModel.findOne({
        userId: data.userId,
      }).session(session);

      if (!existingProfile) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).send({
          message: "Profile not found",
          success: false,
          data: null,
        });
      }

      const existingCompany = await CompanyModel.findById(
        data.organizationId
      ).session(session);

      if (!existingCompany) {
        await session.abortTransaction();
        session.endSession();
        throw new Error("Company not found");
      }

      const isCompanyIncludeProfile = existingCompany.employees.some(
        (item) => item.toString() === existingProfile.userId.toString()
      );

      if (!isCompanyIncludeProfile) {
        existingCompany.employees.push(existingProfile.userId);
        await existingCompany.save({ session });

        existingProfile.companies.push(existingCompany._id);
        existingProfile.role.push(data.role);
        existingProfile.position.push(data.position);
        await existingProfile.save({ session });

        await session.commitTransaction();
        session.endSession();

        success = true;
        res.status(200).send({
          message: "Request approved successfully",
          success: true,
          data: existingCompany,
        });
      } else {
        await session.abortTransaction();
        session.endSession();

        success = true;
        res.status(200).send({
          message: "User already belongs to the company",
          success: true,
          data: existingCompany,
        });
      }
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      attempt++;

      if (attempt >= MAX_RETRIES) {
        res.status(err.status || 500).send({
          message: err.message || "Internal Server Error",
          success: false,
          data: null,
        });
      }
    }
  }
};
