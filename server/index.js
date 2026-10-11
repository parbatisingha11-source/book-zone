import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import books from "../src/data/books.js";

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set to a random value at least 32 characters long.");
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cart: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        quantity: { type: Number, min: 1, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ["Processing", "Delivered", "Cancelled"], default: "Processing" },
  },
  { timestamps: true }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);
const Order = mongoose.model("Order", orderSchema);
const ContactMessage = mongoose.model("ContactMessage", contactSchema);

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Please log in to continue." });

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: "Your account is no longer available." });
  req.user = user;
  next();
});

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Administrator access is required." });
  }
  next();
};

const signInToken = (user) =>
  jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" });

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const validateBook = (data) => {
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const author = typeof data.author === "string" ? data.author.trim() : "";
  const category = typeof data.category === "string" ? data.category.trim() : "";
  const price = Number(data.price);
  const image = typeof data.image === "string" ? data.image.trim() : "";

  if (!title || !author || !category || !Number.isFinite(price) || price < 0) {
    return null;
  }
  return { title, author, category, price, image };
};

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/auth/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return res.status(400).json({ message: "Enter a name, valid email, and password (at least 8 characters)." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, password: passwordHash });
  res.status(201).json({ token: signInToken(user), user: publicUser(user) });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  res.json({ token: signInToken(user), user: publicUser(user) });
}));

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get("/api/books", asyncHandler(async (_req, res) => {
  res.json(await Book.find().sort({ title: 1 }));
}));

app.get("/api/recommendations", asyncHandler(async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!query) return res.json([]);
  const terms = query.split(/\s+/).filter(Boolean).slice(0, 8);
  const conditions = terms.flatMap((term) =>
    ["title", "author", "category"].map((field) => ({
      [field]: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
    }))
  );
  const matches = await Book.find({ $or: conditions }).limit(5);
  res.json(matches);
}));

app.get("/api/cart", authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("cart.book");
  res.json(user.cart.filter((item) => item.book).map((item) => ({
    book: item.book,
    quantity: item.quantity,
  })));
}));

app.post("/api/cart", authenticate, asyncHandler(async (req, res) => {
  const book = await Book.findById(req.body.bookId);
  if (!book) return res.status(404).json({ message: "Book not found." });
  const existing = req.user.cart.find((item) => item.book.equals(book.id));
  if (existing) existing.quantity += 1;
  else req.user.cart.push({ book: book.id, quantity: 1 });
  await req.user.save();
  res.status(201).json({ message: "Book added to cart." });
}));

app.delete("/api/cart/:bookId", authenticate, asyncHandler(async (req, res) => {
  req.user.cart = req.user.cart.filter((item) => !item.book.equals(req.params.bookId));
  await req.user.save();
  res.json({ message: "Book removed from cart." });
}));

app.post("/api/orders", authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("cart.book");
  const items = user.cart
    .filter((item) => item.book)
    .map((item) => ({
      book: item.book.id,
      title: item.book.title,
      price: item.book.price,
      quantity: item.quantity,
    }));
  if (items.length === 0) return res.status(400).json({ message: "Your cart is empty." });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({ user: user.id, items, total });
  user.cart = [];
  await user.save();
  res.status(201).json(order);
}));

app.get("/api/orders", authenticate, asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user.id }).sort({ createdAt: -1 }));
}));

app.post("/api/contact", asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof message !== "string" || !message.trim()
  ) {
    return res.status(400).json({ message: "Please provide your name, a valid email, and a message." });
  }
  await ContactMessage.create({ name: name.trim(), email: email.trim(), message: message.trim() });
  res.status(201).json({ message: "Message sent successfully." });
}));

app.get("/api/admin/stats", authenticate, requireAdmin, asyncHandler(async (_req, res) => {
  const [booksCount, ordersCount, usersCount, sales] = await Promise.all([
    Book.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: "user" }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
  ]);
  res.json({ booksCount, ordersCount, usersCount, sales: sales[0]?.total || 0 });
}));

app.post("/api/admin/books", authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const bookData = validateBook(req.body);
  if (!bookData) return res.status(400).json({ message: "Provide a title, author, category, and valid price." });
  res.status(201).json(await Book.create(bookData));
}));

app.delete("/api/admin/books/:bookId", authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const deleted = await Book.findByIdAndDelete(req.params.bookId);
  if (!deleted) return res.status(404).json({ message: "Book not found." });
  res.json({ message: "Book deleted." });
}));

app.get("/api/admin/orders", authenticate, requireAdmin, asyncHandler(async (_req, res) => {
  res.json(await Order.find().populate("user", "name email").sort({ createdAt: -1 }));
}));

app.patch("/api/admin/orders/:orderId", authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const allowedStatuses = ["Processing", "Delivered", "Cancelled"];
  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ message: "Choose a valid order status." });
  }
  const order = await Order.findByIdAndUpdate(
    req.params.orderId,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!order) return res.status(404).json({ message: "Order not found." });
  res.json(order);
}));

app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: "This record already exists." });
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: "The submitted data is invalid." });
  }
  console.error(error);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

const seedDatabase = async () => {
  if ((await Book.countDocuments()) === 0) {
    const uniqueBooks = [...new Map(books.map((book) => [`${book.title}-${book.author}`, book])).values()];
    await Book.insertMany(uniqueBooks.map(({ title, author, price, category, image }) => ({
      title, author, price, category, image,
    })));
    console.log(`Seeded ${uniqueBooks.length} books.`);
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Library Admin" } = process.env;
  if (Boolean(ADMIN_EMAIL) !== Boolean(ADMIN_PASSWORD)) {
    throw new Error("Set both ADMIN_EMAIL and ADMIN_PASSWORD, or leave both empty.");
  }
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const email = ADMIN_EMAIL.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || ADMIN_PASSWORD.length < 12) {
      throw new Error("ADMIN_EMAIL must be valid and ADMIN_PASSWORD must be at least 12 characters.");
    }
    const existingAdmin = await User.findOne({ email });
    if (!existingAdmin) {
      await User.create({
        name: ADMIN_NAME,
        email,
        password: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: "admin",
      });
      console.log(`Created admin account for ${email}.`);
    } else if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();
    }
  }
};

const start = async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai_digital_library");
  await seedDatabase();
  app.listen(port, () => console.log(`API server listening on port ${port}.`));
};

start().catch((error) => {
  console.error("Unable to start API server:", error);
  process.exitCode = 1;
});
