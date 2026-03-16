import mongoose, { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique:true
  },
  phone: {
    type: String,
    required: true,
    unique:true,
    trim:true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    default: "user"
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
}, { timestamps: true });

const User = models.User || model("User", userSchema);

export default User;