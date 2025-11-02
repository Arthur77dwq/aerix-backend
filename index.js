import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Supabase
const supabase = createClient(
  "https://scjgozqggbugidcfofsz.supabase.co",  // e.g., https://scjgozqggbugidcfofsz.supabase.co "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjamdvenFnZ2J1Z2lkY2ZvZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODE3MDEsImV4cCI6MjA3NzY1NzcwMX0.u-Q_YkwnuKdpckAIxmnselvjAy83rc_uj1ww2iTGuZ8"     // Your anon/public key
);

// ========================
// Fetch live leads from OpenCorporates
// ========================
app.get("/api/fetch-leads", async (req, res) => {
  const { industry, location, per_page = 10 } = req.query;
  try {
    const response = await axios.get(`https://api.opencorporates.com/v0.4/companies/search`, {
      params: {
        q: industry,
        jurisdiction_code: location,
        per_page
      }
    });

    // Optional: filter by size locally
    const filtered = response.data.results.companies.map(c => ({
      name: c.company.name,
      industry: industry || "",
      location: location || "",
      website: c.company.company_number, // placeholder, can fetch real website if available
      employees: null
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// Supabase CRUD endpoints
// ========================
app.get("/api/leads", async (req, res) => {
  const { data, error } = await supabase.from("leads").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post("/api/leads", async (req, res) => {
  const { company_name, industry, location, website, employees, revenue } = req.body;
  const { data, error } = await supabase.from("leads").insert([
    { company_name, industry, location, website, employees, revenue }
  ]);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.listen(3000, () => console.log("Aerix backend running 🚀 on port 3000"));
