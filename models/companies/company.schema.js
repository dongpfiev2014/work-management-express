import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    industry: {
      type: String,
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    description: {
      type: String,
    },
    companyLogo: {
      type: String,
    },
    department: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "departments",
      },
    ],
  },
  {
    // getTimestampsConfig()
    timestamps: true,
  }
);

export default CompanySchema;
