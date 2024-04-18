import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
  name: {
    type: String, // Assuming backOdds contains numbers
  },

  phone: {
    type: String,
    unique: true,
    required: true, // Assuming layOdds contains numbers
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  
  },
  is_admin: {
    type: Boolean,
    default: false, // Default value is set to false (0)
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);
export default User;
