import mongoose from "mongoose";
import Collections from "../../database/collection.js";
import ProfileSchema from "./profile.schema.js";

const ProfileModel = mongoose.model(Collections.PROFILES, ProfileSchema);

export default ProfileModel;
