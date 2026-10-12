
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Lead = require("./models/lead");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const sampleLeads = [
  { id: 1, name: "Aarav Sharma", company: "TechNova", email: "aarav@technova.example", industry: "Technology", location: "Bengaluru", status: "Qualified", score: 92 },
  { id: 2, name: "Priya Mehta", company: "GrowthLabs", email: "priya@growthlabs.example", industry: "Marketing", location: "Mumbai", status: "New", score: 78 },
  { id: 3, name: "Rohan Verma", company: "CloudPeak", email: "rohan@cloudpeak.example", industry: "Technology", location: "Pune", status: "Contacted", score: 65 },
  { id: 4, name: "Ananya Patel", company: "FinEdge", email: "ananya@finedge.example", industry: "Finance", location: "Ahmedabad", status: "Qualified", score: 88 },
  { id: 5, name: "Kabir Singh", company: "RetailFlow", email: "kabir@retailflow.example", industry: "Retail", location: "Delhi", status: "New", score: 54 },
  { id: 6, name: "Isha Gupta", company: "DataBridge", email: "isha@databridge.example", industry: "Technology", location: "Hyderabad", status: "Contacted", score: 83 },
  { id: 7, name: "Vivaan Joshi", company: "MarketPilot", email: "vivaan@marketpilot.example", industry: "Marketing", location: "Indore", status: "New", score: 71 },
  { id: 8, name: "Meera Shah", company: "FinEdge", email: "meera@finedge.example", industry: "Finance", location: "Mumbai", status: "Qualified", score: 95 },
];

function calculateLeadScore({ name, company, email, industry, location }) {
  let score = 40;
  const reasons = [];

  if (name.trim().split(/\s+/).length >= 2) {
    score += 10;
    reasons.push("Full name provided (+10)");
  }

  if (company.trim().length >= 3) {
    score += 15;
    reasons.push("Company details provided (+15)");
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    score += 15;
    reasons.push("Email format is valid (+15)");
  }

  if (industry.trim()) {
    score += 10;
    reasons.push("Industry provided (+10)");
  }

  if (location.trim()) {
    score += 10;
    reasons.push("Location provided (+10)");
  }

  return {
    score: Math.min(score, 100),
    scoreReasons: reasons,
  };
}

app.get("/", (req, res) => {
  res.json({ message: "Caprae Lead Generation API is running" });
});

app.get("/api/leads", async (req, res) => {
  try {
    const { search = "", industry, status } = req.query;
    const term = String(search).toLowerCase();

    const allLeads = await Lead.find().sort({ createdAt: -1, id: -1 }).lean();

    const results = allLeads.filter((lead) => {
      const matchesSearch = [
        lead.name,
        lead.company,
        lead.email,
        lead.location,
      ].some((value) => value.toLowerCase().includes(term));

      return (
        matchesSearch &&
        (!industry || industry === "All industries" ||
          lead.industry === industry) &&
        (!status || status === "All statuses" ||
          lead.status === status)
      );
    });

    res.json({ total: results.length, leads: results });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads." });
  }
});

app.post("/api/leads", async (req, res) => {
  try {
    const { name, company, email, industry, location } = req.body;

    if (![name, company, email, industry, location].every(
      (value) => typeof value === "string" && value.trim()
    )) {
      return res.status(400).json({
        message: "All lead fields are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const duplicate = await Lead.exists({ email: cleanEmail });

    if (duplicate) {
      return res.status(409).json({
        message: "A lead with this email already exists.",
      });
    }

    const cleanData = {
      name: name.trim(),
      company: company.trim(),
      email: cleanEmail,
      industry: industry.trim(),
      location: location.trim(),
    };

    const { score, scoreReasons } = calculateLeadScore(cleanData);

    const lead = await Lead.create({
      id: Date.now(),
      ...cleanData,
      status: "New",
      score,
      scoreReasons,
    });

    res.status(201).json({
      message: "Lead added successfully",
      lead,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A lead with this email already exists.",
      });
    }

    res.status(500).json({ message: "Failed to add lead." });
  }
});

app.patch("/api/leads/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["New", "Qualified", "Contacted"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid lead status.",
      });
    }

    const lead = await Lead.findOneAndUpdate(
      { id: Number(req.params.id) },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    res.json({ message: "Lead status updated", lead });
  } catch (error) {
    res.status(500).json({ message: "Failed to update lead status." });
  }
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    const count = await Lead.countDocuments();

    if (count === 0) {
      await Lead.insertMany(sampleLeads);
      console.log("8 sample leads inserted into MongoDB");
    }

    app.listen(PORT, () => {
      console.log(`Caprae API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
