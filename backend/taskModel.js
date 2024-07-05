const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "paused", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["urgent", "high", "normal", "low"],
      default: "normal",
    },
    startTime: {
      type: Date,
    },
    pausedTime: {
      type: Date,
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
