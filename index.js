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

