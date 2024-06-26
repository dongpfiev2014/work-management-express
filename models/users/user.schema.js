import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      required: true,
      type: String,
      unique: true,
    },
    password: {
      required: true,
      type: String,
    },
    role: [String],
  },
  { timestamps: true }
);

UserSchema.path("username").validate(function (value) {
  if (value.length < 8) {
    this.invalidate("username", "Username must be at least 8 characters.");
  }
});

export default UserSchema;
