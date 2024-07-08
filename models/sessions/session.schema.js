import mongoose from "mongoose";
import { getTimestampsConfig } from "../../utils/timestamps.js";

const IpDetailsSchema = new mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    country_code: {
      type: String,
      required: true,
    },
    country_name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postal: {
      type: String,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    IPv4: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
  },
  getTimestampsConfig()
);

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    ipDetails: [IpDetailsSchema],
  },
  getTimestampsConfig()
);

SessionSchema.post("findOneAndUpdate", async function (doc) {
  if (doc.ipDetails.length > 2) {
    doc.ipDetails = doc.ipDetails.slice(-2);
    await doc.save();
  }
});
export default SessionSchema;
