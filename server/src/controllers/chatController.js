import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Product from "../models/Product.js";
import { emitToUser } from "../socket.js";

// Opens the thread for a listing, creating it the first time. This is what
// the "Contact seller" button calls.
export const startConversation = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const sellerId = product.seller.toString();

    if (sellerId === req.user.id) {
      return res
        .status(400)
        .json({ message: "That's your own listing" });
    }

    // Sorted so the pair always maps to the same conversation regardless
    // of who starts it.
    const participants = [req.user.id, sellerId].sort();

    let conversation = await Conversation.findOne({
      participants,
      product: product._id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        product: product._id,
      });
    }

    res.json({ conversationId: conversation._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants", "name avatar")
      .populate("product", "title images image price")
      .sort({ lastMessageAt: -1 });

    // Reshape so the client gets "the other person" instead of having to
    // filter yourself out of the array on every render.
    const shaped = conversations.map((c) => ({
      _id: c._id,
      product: c.product,
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt,
      unread: c.unread?.get(req.user.id) || 0,
      other: c.participants.find((p) => p._id.toString() !== req.user.id),
    }));

    res.json(shaped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    // Opening the thread clears your own unread count.
    conversation.unread.set(req.user.id, 0);
    await conversation.save();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Message can't be empty" });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      text: text.trim(),
    });

    const recipient = conversation.participants.find(
      (p) => p.toString() !== req.user.id
    );

    conversation.lastMessage = text.trim().slice(0, 120);
    conversation.lastMessageAt = new Date();
    conversation.unread.set(
      recipient.toString(),
      (conversation.unread.get(recipient.toString()) || 0) + 1
    );

    await conversation.save();

    const populated = await message.populate("sender", "name avatar");

    // Push it live if they're online. The REST response still works on its
    // own, so chat degrades to "refresh to see new messages" if the socket
    // connection drops.
    emitToUser(recipient.toString(), "message:new", {
      conversationId: conversation._id,
      message: populated,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    }).select("unread");

    const total = conversations.reduce(
      (sum, c) => sum + (c.unread?.get(req.user.id) || 0),
      0
    );

    res.json({ count: total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
