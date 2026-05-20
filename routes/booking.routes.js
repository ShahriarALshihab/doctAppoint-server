const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();


let bookingsCollection;

const setCollection = (collection) => {
  bookingsCollection = collection;
};


// Get all bookings for the loggedin user
router.get("/", verifyToken, async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email query param is required" });
  }

  
  if (req.user.email !== email) {
    return res.status(403).json({ message: "Forbidden: Email mismatch" });
  }

  try {
    const bookings = await bookingsCollection
      .find({ userEmail: email })
      .sort({ _id: -1 })
      .toArray();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});


// Create a new booking
router.post("/", verifyToken, async (req, res) => {
  const booking = req.body;

  if (!booking.userEmail || !booking.doctorName || !booking.patientName) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

 
  if (req.user.email !== booking.userEmail) {
    return res.status(403).json({ message: "Forbidden: Email mismatch" });
  }

  try {
    const bookingData = {
      ...booking,
      status: "pending",
      createdAt: new Date(),
    };
    const result = await bookingsCollection.insertOne(bookingData);
    res.status(201).json({
      message: "Booking created successfully",
      insertedId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create booking" });
  }
});


// Update an existing booking
router.patch("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  
  const allowedUpdates = {
    patientName: updates.patientName,
    gender: updates.gender,
    phone: updates.phone,
    appointmentDate: updates.appointmentDate,
    appointmentTime: updates.appointmentTime,
  };

  
  Object.keys(allowedUpdates).forEach(
    (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
  );

  try {
    // Verify owner before updating
    const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: "Forbidden: Not your booking" });
    }

    const result = await bookingsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: allowedUpdates },
      { returnDocument: "after" }
    );

    res.json({
      message: "Booking updated successfully",
      booking: result,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update booking" });
  }
});


// Delete a booking
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  try {
    // Verify owner before deleting
    const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: "Forbidden: Not your booking" });
    }

    await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete booking" });
  }
});

module.exports = { router, setCollection };
