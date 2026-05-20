const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();


router.post("/jwt", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

module.exports = router;
