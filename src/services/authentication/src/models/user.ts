import mongoose, { Document, Model } from "mongoose";

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
  email: string;
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
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    require: true,
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
  email: {
    type: String,
    require: true,
  },
  dob: {
    type: Date,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  refreshToken: String,
});

export const User = mongoose.model(
  "user",
  userSchema
);
