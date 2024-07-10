import mongoose from "mongoose";

const IpDetailsSchema = new mongoose.Schema(
  {
    country_code: {
      type: String,
    },
    country_name: {
      type: String,
    },
    city: {
      type: String,
    },
    postal: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    IPv4: {
      type: String,
      required: true,
    },
    state: {
      type: String,
    },
  },
  {
    _id: false,
  }
  // getTimestampsConfig()
);

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    ipDetails: {
      type: [IpDetailsSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0,
      },
    },
  },
  // getTimestampsConfig()
  { timestamps: true }
);

// SessionSchema.post("findOneAndUpdate", async function (doc) {
//   if (doc.ipDetails.length > 2) {
//     doc.ipDetails = doc.ipDetails.slice(-2);
//     await doc.save();
//   }
// });

export default SessionSchema;
