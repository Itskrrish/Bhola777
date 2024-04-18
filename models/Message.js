import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
  body: {
    type: String, // Assuming backOdds contains numbers
  },

  sender_id: {
    type: String,
    default: "660bb76af9452dc5b6ead1f6",
    // Assuming layOdds contains numbers
  },
  reciever_id: {
    type: String,
    default: "660bb82fffe2c4654a2eed55",
  },
  is_seen: {
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

const Message = mongoose.model("Message", UserSchema);
export default Message;
