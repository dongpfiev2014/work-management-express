import mongoose from "mongoose";
import Collections from "../../database/collection.js";
import SessionSchema from "./session.schema.js";

const SessionModel = mongoose.model(Collections.SESSIONS, SessionSchema);

export default SessionModel;
