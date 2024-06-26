import UserSchema from "./user.schema.js";
import mongoose from "mongoose";
import Collection from "../../database/collection.js";

const UserModel = mongoose.model(Collection.USERS, UserSchema);

export default UserModel;
