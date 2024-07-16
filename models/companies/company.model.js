import mongoose from "mongoose";
import Collections from "../../database/collection.js";
import CompanySchema from "./company.schema.js";

const CompanyModel = mongoose.model(Collections.COMPANIES, CompanySchema);

export default CompanyModel;
