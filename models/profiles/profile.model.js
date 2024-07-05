import mongoose from "mongoose";
import Collections from "../../database/collection.js";
import ProfilesSchema from "./profile.schema.js";

const ProfilesModel = mongoose.model(Collections.PROFILES, ProfilesSchema);

export default ProfilesModel;
