// Tops the shop up with the demo catalogue WITHOUT deleting anything.
//
// Run with:  npm run seed:products
// Or to list everything under one account:
//            npm run seed:products -- manaswini@gmail.com
//
// Unlike seed.js this leaves your existing listings, users and chats alone.
// Listings whose title is already in the database are skipped, so running it
// twice does not create duplicates.

import "./config/env.js";

import mongoose from "mongoose";

import connectDB from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import CATALOG from "./data/catalog.js";

const run = async () => {
  await connectDB();

  // An email on the command line puts every listing under that one account.
  const email = process.argv[2];

  let sellers;

  if (email) {
    sellers = await User.find({ email: email.toLowerCase() }).select("_id name");

    if (!sellers.length) {
      console.error(`No account with the email ${email}.`);
      await mongoose.connection.close();
      process.exit(1);
    }
  } else {
    // Otherwise spread them across whoever can sell. Admins count — on a
    // fresh install that is often the only account there is.
    sellers = await User.find({ role: { $in: ["seller", "admin"] } }).select("_id name");

    if (!sellers.length) sellers = await User.find().select("_id name").limit(5);
  }

  if (!sellers.length) {
    console.error(
      "No users in the database, so there is nobody to list these under.\n" +
        "Register an account first, or run `npm run seed` for the full demo set."
    );
    await mongoose.connection.close();
    process.exit(1);
  }

  const existing = new Set(
    (await Product.find().select("title")).map((p) => p.title.toLowerCase())
  );

  const fresh = CATALOG.filter((item) => !existing.has(item.title.toLowerCase()));

  if (!fresh.length) {
    console.log("Every catalogue listing is already in the shop. Nothing to add.");
    await mongoose.connection.close();
    process.exit(0);
  }

  const created = await Product.create(
    fresh.map((item, i) => ({
      ...item,
      seller: sellers[i % sellers.length]._id,
      status: "available",
    }))
  );

  const skipped = CATALOG.length - fresh.length;

  console.log(`\nAdded ${created.length} listings.`);
  if (skipped) console.log(`Skipped ${skipped} already in the shop.`);
  console.log(`Listed under: ${sellers.map((s) => s.name).join(", ")}`);
  console.log(`Total listings now: ${await Product.countDocuments()}\n`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
