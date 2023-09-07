import mongoose, { Document, Model, HookNextFunction } from "mongoose";
import bcrypt from "bcrypt";
import { NextFunction } from "express";
import CustomError from "../../utils/error";

enum UserRole {
  ADMIN = "admin",
  PATIENT = "patient",
  DOCTOR = "doctor",
}

enum DoctorSubRole {
  ADMIN = "admin",
  DOCTOR = "doctor",
  RECEPTIONIST = "receptionist",
  LAB_ASSISTANT = "lab_assistant",
  PHARMACY_STAFF = "pharmacy_staff",
}

interface IUser extends Document {
  id: string;
  name: string;
  role: UserRole;
  subRole?: DoctorSubRole;
  dob: Date;
  password: string;
  comparePassword: (password: string) => Promise<boolean>;
  refreshToken?: string;
}

interface IUserModel extends Model<IUser> {}

const userSchema = new mongoose.Schema<IUser>({
  id: {
    unique: true,
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(UserRole),
  },
  subRole: {
    type: String,
    enum: Object.values(DoctorSubRole),
    required: function (this: IUser) {
      return this.role === UserRole.DOCTOR;
    },
    validate: {
      validator: function (this: IUser) {
        return (
          this.role !== UserRole.DOCTOR ||
          (this.role === UserRole.DOCTOR && !!this.subRole)
        );
      },
      message: "Sub-Role is required for the doctor role only",
    },
  },
  dob: {
    type: Date,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: String,
});

userSchema.pre(
  "validate",
  async function (this: IUser, next: HookNextFunction) {
    if (!this.isModified("password")) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(new CustomError("Error while encrypting password", 500));
    }
  }
);

userSchema.methods.comparePassword = async function (password: string) {
  const user = this as IUser;
  return bcrypt.compare(password, user.password).catch((e) => false);
};

export const User: IUserModel = mongoose.model<IUser, IUserModel>(
  "User",
  userSchema
);
