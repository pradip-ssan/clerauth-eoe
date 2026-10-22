import "server-only";
import mongoose, { Schema, model, models } from "mongoose";

export const USER_ROLES = ["user", "instructor", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  role: UserRole;
  isActive: boolean;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      default: "",
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User =
  (models.User as mongoose.Model<IUser> | undefined) ??
  model<IUser>("User", userSchema);

export default User;
