import mongoose from "mongoose";
import Collections from "../../database/collection.js";
import CommentSchema from "./comment.schema.js";

const CommentModel = mongoose.model(Collections.COMMENTS, CommentSchema);

export default CommentModel;
