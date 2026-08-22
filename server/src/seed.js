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

const LISTINGS = [
  ["Faded Levi's 501 straight jeans", "Genuine 90s pair, honest fading at the knees and seat. Zip is smooth, no repairs anywhere. Sits high on the waist.", 1450, "bottoms", "L", "good", "Levi's"],
  ["Oversized flannel overshirt", "Heavy brushed cotton in rust and charcoal. Works as a shirt or a light jacket. Barely worn.", 890, "outerwear", "XL", "like new", "Uniqlo"],
  ["Cropped corduroy jacket", "Mustard corduroy, cropped at the waist. One tiny mark inside the cuff, invisible when worn.", 1200, "outerwear", "M", "good", ""],
  ["Black cotton slip dress", "Simple bias-cut slip, mid length. Adjustable straps. Great base for layering.", 750, "dresses", "S", "like new", "Zara"],
  ["Striped cotton tee", "Classic navy and cream breton stripe. Soft from washing but no holes or stretch at the neck.", 320, "tops", "M", "good", ""],
  ["Leather derby shoes", "Brown leather, resoled once. Creased across the toe as leather does. Comfortable straight away.", 2100, "footwear", "L", "fair", "Clarks"],
  ["Pleated midi skirt", "Deep green, falls just below the knee. Elastic waist. Never worn, tag still attached.", 640, "bottoms", "M", "like new", ""],
  ["Chunky knit cardigan", "Cream cable knit with real horn buttons. Warm without being heavy.", 1100, "tops", "L", "good", ""],
  ["Canvas tote bag", "Thick unbleached canvas, screen printed on one side. Holds a laptop easily.", 280, "accessories", "free size", "good", ""],
  ["Wide-leg linen trousers", "Natural linen, drawstring waist. Wrinkles like linen should. Ideal for summer.", 980, "bottoms", "S", "like new", "H&M"],
  ["Vintage band tee", "Single-stitch, properly thin and soft. Print is cracked in the way collectors want.", 1600, "tops", "M", "fair", ""],
  ["Wool peacoat", "Navy melton wool, double breasted. Lining fully intact. Serious winter coat.", 2800, "outerwear", "L", "good", ""],
  ["Silk scarf", "Hand-rolled edges, floral print in blues. Small pull on one corner, hidden when tied.", 450, "accessories", "free size", "fair", ""],
  ["White canvas sneakers", "Cleaned and deodorised. Soles have wear but plenty of life left.", 700, "footwear", "M", "good", "Converse"],
  ["Denim pinafore dress", "Mid-wash denim, front pockets, adjustable straps. Great over a tee.", 1050, "dresses", "M", "like new", ""],
  ["Ribbed turtleneck", "Fine merino rib in dark plum. Holds its shape, no pilling.", 820, "tops", "S", "like new", ""],
  ["Cargo utility trousers", "Olive ripstop with six working pockets. Hem taken up slightly by a tailor.", 940, "bottoms", "L", "good", ""],
  ["Beaded shoulder bag", "Hand-beaded in blues and silver. Lining replaced last year. Party-sized, not everyday.", 1350, "accessories", "free size", "good", ""],
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
    LISTINGS.map(([title, description, price, category, size, condition, brand], i) => ({
      title,
      description,
      price,
      category,
      size,
      condition,
      brand,
      images: [photo(`tv-${i}-a`), photo(`tv-${i}-b`)],
      tryOnImage: photo(`tv-${i}-flat`),
      seller: i % 2 === 0 ? meera._id : rohit._id,
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
