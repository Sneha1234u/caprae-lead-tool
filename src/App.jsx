
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialLeads = [
  { id: 1, name: "Aarav Sharma", company: "TechNova", email: "aarav@technova.example", industry: "Technology", location: "Bengaluru", status: "Qualified", score: 92 },
  { id: 2, name: "Priya Mehta", company: "GrowthLabs", email: "priya@growthlabs.example", industry: "Marketing", location: "Mumbai", status: "New", score: 78 },
  { id: 3, name: "Rohan Verma", company: "CloudPeak", email: "rohan@cloudpeak.example", industry: "Technology", location: "Pune", status: "Contacted", score: 65 },
  { id: 4, name: "Ananya Patel", company: "FinEdge", email: "ananya@finedge.example", industry: "Finance", location: "Ahmedabad", status: "Qualified", score: 88 },
  { id: 5, name: "Kabir Singh", company: "RetailFlow", email: "kabir@retailflow.example", industry: "Retail", location: "Delhi", status: "New", score: 54 },
  { id: 6, name: "Isha Gupta", company: "DataBridge", email: "isha@databridge.example", industry: "Technology", location: "Hyderabad", status: "Contacted", score: 83 },
  { id: 7, name: "Vivaan Joshi", company: "MarketPilot", email: "vivaan@marketpilot.example", industry: "Marketing", location: "Indore", status: "New", score: 71 },
  { id: 8, name: "Meera Shah", company: "FinEdge", email: "meera@finedge.example", industry: "Finance", location: "Mumbai", status: "Qualified", score: 95 },
];

function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [status, setStatus] = useState("All statuses");
  const [scoreSort, setScoreSort] = useState("none");
  const [showForm, setShowForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    email: "",
    industry: "Technology",
    location: "",
  });

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/leads"
        );

        if (!response.ok) {
          throw new Error("Failed to load leads");
        }

        const data = await response.json();

        setLeads(Array.isArray(data) ? data : data.leads || []);
        setApiError("");
      } catch (error) {
        setApiError(
          "Backend se connection nahi ho raha. Check karo ki server running hai."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);


const filteredLeads = useMemo(() => {
  const filtered = leads.filter((lead) => {
    const term = search.toLowerCase();

    const matchesSearch = [
      lead.name,
      lead.company,
      lead.email,
      lead.location,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(term)
    );

    return (
      matchesSearch &&
      (industry === "All industries" || lead.industry === industry) &&
      (status === "All statuses" || lead.status === status)
    );
  });

  if (scoreSort === "high") {
    filtered.sort((a, b) => Number(b.score) - Number(a.score));
  } else if (scoreSort === "low") {
    filtered.sort((a, b) => Number(a.score) - Number(b.score));
  }

  return filtered;
}, [leads, search, industry, status, scoreSort]);
  const qualifiedCount = leads.filter(
    (lead) => lead.status === "Qualified"
  ).length;

  const averageScore = leads.length
    ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length)
    : 0;

  async function updateStatus(id, nextStatus) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/leads/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update lead");
    }

    const updatedLead = await response.json();

    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? { ...lead, ...updatedLead }
          : lead
      )
    );

    setApiError("");
  } catch (error) {
    alert("Lead update nahi hui. Backend check karo.");
  }
}
async function addLead(event) {
  event.preventDefault();
const leadData = {
    ...newLead,
    name: newLead.name.trim(),
    company: newLead.company.trim(),
    email: newLead.email.trim(),
    location: newLead.location.trim(),
  };

  try {
    const response = await fetch("http://localhost:5000/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to add lead");
    }

    const savedLead = data.lead || data;

    setLeads((current) => [savedLead, ...current]);

    setNewLead({
      name: "",
      company: "",
      email: "",
      industry: "Technology",
      location: "",
    });

    setShowForm(false);
    setApiError("");
  } catch (error) {
    alert(error.message || "Lead save nahi hui. Backend check karo.");
  }
}


  function exportCSV() {
    const headers = [
      "Name", "Company", "Email", "Industry",
      "Location", "Status", "Score",
    ];

    const rows = filteredLeads.map((lead) =>
      [
        lead.name,
        lead.company,
        lead.email,
        lead.industry,
        lead.location,
        lead.status,
        lead.score,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "caprae-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">C</span>
          <span>caprae<span className="brand-dot">.</span></span>
        </a>

        <p className="nav-label">WORKSPACE</p>
        <a className="nav-item active" href="#dashboard">▦ <span>Dashboard</span></a>
        <a className="nav-item" href="#leads">♙ <span>All leads</span></a>
        <a className="nav-item" href="#leads">◎ <span>Qualified leads</span></a>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Lead workspace</strong>
            <p>Manage and organize your prospects in one place.</p>
          </div>
          <div className="profile">
            <div className="avatar">CD</div>
            <div><strong>Caprae Demo</strong><small>Workspace admin</small></div>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Dashboard</div>
          <div className="topbar-right">
            <span className="live-dot"></span>
            <span>Demo workspace</span>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">YOUR SALES WORKSPACE</p>
            <h1>Lead generation</h1>
            <p className="subtitle">Find, organize and prioritize your business leads.</p>
          </div>
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            <span>＋</span> Add new lead
          </button>
        </section>

        {showForm && (
          <form className="lead-form" onSubmit={addLead}>
            <div className="form-heading">
              <h2>Add a new lead</h2>
              <button type="button" className="close-button" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="form-grid">
              <label>Full name<input required value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} placeholder="e.g. Rahul Sharma" /></label>
              <label>Company<input required value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} placeholder="Company name" /></label>
              <label>Email address<input required type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} placeholder="name@company.com" /></label>
              <label>Industry<select value={newLead.industry} onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}><option>Technology</option><option>Marketing</option><option>Finance</option><option>Retail</option><option>Healthcare</option><option>Education</option><option>Other</option></select></label>
              <label>Location<input required value={newLead.location} onChange={(e) => setNewLead({ ...newLead, location: e.target.value })} placeholder="City" /></label>
            </div>
            <button className="primary-button" type="submit">Save lead</button>
          </form>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-top"><span>Total leads</span><span className="stat-icon purple">♙</span></div>
            <div className="stat-value">{leads.length}</div>
            <div className="stat-foot">All leads in your workspace</div>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Qualified leads</span><span className="stat-icon green">✓</span></div>
            <div className="stat-value">{qualifiedCount}</div>
            <div className="stat-foot">{leads.length ? Math.round((qualifiedCount / leads.length) * 100) : 0}% of all leads</div>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Average lead score</span><span className="stat-icon orange">↗</span></div>
            <div className="stat-value">{averageScore}<span className="out-of">/100</span></div>
            <div className="stat-foot">Based on lead scoring</div>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Industries covered</span><span className="stat-icon blue">◈</span></div>
            <div className="stat-value">{new Set(leads.map((lead) => lead.industry)).size}</div>
            <div className="stat-foot">Unique industry categories</div>
          </article>
        </section>

        <section className="leads-panel" id="leads">
          <div className="panel-heading">
            <div>
              <h2>All leads <span className="count-pill">{filteredLeads.length}</span></h2>
              <p>Review your prospects and update their status.</p>
            </div>
            <button className="secondary-button" onClick={exportCSV}>↓ <span>Export CSV</span></button>
          </div>

          <div className="filters">
            <div className="search-box">
              <span>⌕</span>
              <input aria-label="Search leads" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, company or email..." />
            </div>
            <select aria-label="Filter by industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option>All industries</option>
              {[...new Set(leads.map((lead) => lead.industry))].sort().map((item) => <option key={item}>{item}</option>)}
            </select>
            <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All statuses</option>
              <option>New</option><option>Qualified</option><option>Contacted</option>
            </select>
            <select
  aria-label="Sort by lead score"
  value={scoreSort}
  onChange={(e) => setScoreSort(e.target.value)}
>
  <option value="none">Sort by score</option>
  <option value="high">Score: Highest to Lowest</option>
  <option value="low">Score: Lowest to Highest</option>
</select>

          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>CONTACT</th><th>COMPANY</th><th>INDUSTRY</th><th>LOCATION</th><th>LEAD SCORE</th><th>STATUS</th></tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td><div className="contact-cell"><div className="contact-avatar">{lead.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><strong>{lead.name}</strong><small>{lead.email}</small></div></div></td>
                    <td className="company-cell">{lead.company}</td>
                    <td><span className="industry-tag">{lead.industry}</span></td>
                    <td className="location-cell">{lead.location}</td>

                    <td>
  <div className="score-cell">
    <div className="score-track">
      <div
        className={`score-fill ${
          lead.score >= 80 ? "high" : lead.score >= 60 ? "medium" : "low"
        }`}
        style={{ width: `${lead.score}%` }}
      />
    </div>
    <strong>{lead.score}</strong>
  </div>

  {lead.scoreReasons?.length > 0 && (
    <details className="score-reasons">
      <summary>Why this score?</summary>
      <ul>
        {lead.scoreReasons.map((reason, index) => (
          <li key={index}>{reason}</li>
        ))}
      </ul>
    </details>
  )}
</td>


                    <td><select className={`status-select status-${lead.status.toLowerCase()}`} value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)} aria-label={`Status for ${lead.name}`}><option>New</option><option>Qualified</option><option>Contacted</option></select></td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && <tr><td colSpan="6" className="empty-state">No leads match your search. Try another filter or add a new lead.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="table-footer">Showing {filteredLeads.length} of {leads.length} leads <span>Demo data · Not connected to a live data provider</span></div>
        </section>

        <footer className="footer">Caprae Lead Generation <span>Built for smarter prospect management</span></footer>
      </main>
    </div>
  );
}

export default App;
