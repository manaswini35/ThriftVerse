// Fills the database with demo accounts and listings so you can open the app
// and actually see something. Run with: npm run seed
//
// WARNING: this wipes the products, reviews, conversations and messages
// collections, and the three demo accounts below. It leaves other users alone.

import "./config/env.js";

import mongoose from "mongoose";
import bcrypt from "bcrypt";

import connectDB from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Review from "./models/Review.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import CATALOG from "./data/catalog.js";

// Free placeholder photos — no Cloudinary account needed just to look around.
const photo = (seed) => `https://picsum.photos/seed/${seed}/900/1200`;

const ACCOUNTS = [
  {
    name: "Admin",
    email: "admin@thriftverse.test",
    password: "admin1234",
    role: "admin",
    bio: "Keeping the racks tidy.",
    location: "Patna",
  },
  {
    name: "Meera K",
    email: "meera@thriftverse.test",
    password: "meera1234",
    role: "seller",
    bio: "Clearing out a decade of thrift finds. Everything washed and pressed before it ships.",
    location: "Bengaluru",
  },
  {
    name: "Rohit S",
    email: "rohit@thriftverse.test",
    password: "rohit1234",
    role: "seller",
    bio: "Vintage denim and band tees. I only list what I'd wear myself.",
    location: "Delhi",
  },
];


const REVIEWS = [
  [5, "Item was exactly as described and shipped the next morning. Would buy again without thinking about it."],
  [4, "Good condition, honest listing about the wear. Packaging could have been sturdier but nothing was damaged."],
  [5, "Answered every question patiently before I bought. The jacket fits better than anything I own."],
];

const run = async () => {
  await connectDB();

  console.log("Clearing demo data...");

  await Promise.all([
    Product.deleteMany({}),
    Review.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    User.deleteMany({ email: { $in: ACCOUNTS.map((a) => a.email) } }),
  ]);

  console.log("Creating accounts...");

  const users = await User.create(
    await Promise.all(
      ACCOUNTS.map(async (a) => ({
        ...a,
        password: await bcrypt.hash(a.password, 10),
        avatar: photo(`avatar-${a.name}`),
      }))
    )
  );

  const [admin, meera, rohit] = users;

  console.log("Creating listings...");

  const products = await Product.create(
    CATALOG.map((item, i) => ({
      ...item,
      seller: i % 2 === 0 ? meera._id : rohit._id,
      // A couple of sold pieces so the sold state is visible on the grid.
      status: i === 4 || i === 12 ? "sold" : "available",
    }))
  );

  console.log("Creating reviews...");

  await Review.create([
    { seller: meera._id, reviewer: rohit._id, rating: REVIEWS[0][0], comment: REVIEWS[0][1], product: products[0]._id },
    { seller: rohit._id, reviewer: meera._id, rating: REVIEWS[1][0], comment: REVIEWS[1][1], product: products[1]._id },
    { seller: meera._id, reviewer: admin._id, rating: REVIEWS[2][0], comment: REVIEWS[2][1] },
  ]);

  console.log("\nDone. Log in with any of these:\n");
  ACCOUNTS.forEach((a) => console.log(`  ${a.role.padEnd(6)}  ${a.email}  /  ${a.password}`));
  console.log("");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
