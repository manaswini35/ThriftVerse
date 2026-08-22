import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Always stored sorted, so a buyer/seller pair maps to one thread per
    // listing no matter who opens it first.
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    // userId -> number of messages they haven't opened yet.
    unread: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1, product: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
