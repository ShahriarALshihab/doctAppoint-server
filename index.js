const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const {
  router: bookingRoutes,
  setCollection,
} = require("./routes/booking.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://doct-appoint-delta.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("docappoint");
    const bookingsCollection = db.collection("bookings");

    setCollection(bookingsCollection);

    app.use("/auth", authRoutes);
    app.use("/bookings", bookingRoutes);

    app.get("/", (req, res) => {
      res.json({ message: "DocAppoint Server is running ✅" });
    });

    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

run();
