"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";

interface MeResponse {
  user: {
    sub: string;
    email: string;
  };
}

const crmPipeline = [
  { stage: "New", count: 42, value: "$84,300", trend: "+12%" },
  { stage: "Qualified", count: 31, value: "$73,120", trend: "+8%" },
  { stage: "Proposal", count: 18, value: "$51,460", trend: "+5%" },
  { stage: "Won", count: 11, value: "$39,980", trend: "+15%" },
];

const monthlySales = [42, 56, 39, 67, 72, 88, 93, 84, 96, 104, 98, 122];

const invoiceRows = [
  { invoiceNo: "INV-000481", customer: "Northwind Labs", dueDate: "2026-04-22", amount: "$3,480.00", status: "Issued" },
  { invoiceNo: "INV-000479", customer: "Blue Canyon Co", dueDate: "2026-04-19", amount: "$1,920.00", status: "Overdue" },
  { invoiceNo: "INV-000476", customer: "Acme Retail", dueDate: "2026-04-28", amount: "$6,145.50", status: "Draft" },
  { invoiceNo: "INV-000472", customer: "Crescent Foods", dueDate: "2026-05-01", amount: "$2,840.25", status: "Paid" },
];

const inventoryRows = [
  { sku: "RM-ALU-01", name: "Aluminum Sheet 2mm", warehouse: "Main", onHand: 1320, reserved: 180, min: 400, status: "Healthy" },
  { sku: "FG-SMRT-09", name: "Smart Sensor Pro", warehouse: "Main", onHand: 48, reserved: 29, min: 50, status: "Low" },
  { sku: "RM-COP-05", name: "Copper Coil 20m", warehouse: "West", onHand: 85, reserved: 32, min: 100, status: "Low" },
  { sku: "FG-HUB-02", name: "IoT Gateway Hub", warehouse: "Main", onHand: 214, reserved: 41, min: 60, status: "Healthy" },
  { sku: "RM-PCB-11", name: "PCB Board A-11", warehouse: "East", onHand: 560, reserved: 120, min: 180, status: "Healthy" },
];

function statusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "paid":
    case "healthy":
      return "dashboard-pill dashboard-pill-success";
    case "overdue":
    case "low":
      return "dashboard-pill dashboard-pill-danger";
    default:
      return "dashboard-pill dashboard-pill-neutral";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MeResponse["user"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    apiRequest<MeResponse>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => setProfile(response.user))
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Unable to load profile");
      });
  }, [router]);

  const totalPipelineValue = useMemo(() => "$248,860", []);
  const weightedForecast = useMemo(() => "$162,340", []);
  const avgDealSize = useMemo(() => "$7,290", []);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Enterprise Ops Console</p>
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">CRM, billing, analytics, and stock operations in one modern workspace.</p>
        </div>
        <div className="dashboard-user-card">
          <p className="dashboard-user-label">Signed in as</p>
          <p className="dashboard-user-email">{profile?.email ?? "Loading..."}</p>
          <p className="dashboard-user-id">ID: {profile?.sub ?? "--"}</p>
        </div>
      </header>

      {error ? <p className="dashboard-error">Auth warning: {error}</p> : null}

      <section className="dashboard-metrics-grid">
        <article className="dashboard-metric-card">
          <p>Total Pipeline</p>
          <h3>{totalPipelineValue}</h3>
          <span>Across 102 open opportunities</span>
        </article>
        <article className="dashboard-metric-card">
          <p>Weighted Forecast</p>
          <h3>{weightedForecast}</h3>
          <span>Next 30-day expected revenue</span>
        </article>
        <article className="dashboard-metric-card">
          <p>Avg Deal Size</p>
          <h3>{avgDealSize}</h3>
          <span>Last 90 days closed won</span>
        </article>
      </section>

      <section className="dashboard-grid-two">
        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2>CRM Panel</h2>
            <button className="dashboard-link-button">Open leads</button>
          </div>
          <div className="dashboard-crm-grid">
            {crmPipeline.map((stage) => (
              <div key={stage.stage} className="dashboard-crm-item">
                <p className="crm-stage">{stage.stage}</p>
                <p className="crm-count">{stage.count} leads</p>
                <p className="crm-value">{stage.value}</p>
                <span className="crm-trend">{stage.trend}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2>Sales Analytics</h2>
            <span className="dashboard-muted">Monthly MRR trend</span>
          </div>
          <div className="dashboard-chart-wrap" aria-label="Monthly sales chart">
            {monthlySales.map((value, index) => (
              <div key={`${value}-${index}`} className="dashboard-chart-col">
                <div className="dashboard-chart-bar" style={{ height: `${Math.max(18, Math.round(value * 1.3))}px` }} />
                <span>{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][index]}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-grid-two">
        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2>Invoice UI</h2>
            <button className="dashboard-link-button">Create invoice</button>
          </div>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Due</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoiceRows.map((row) => (
                  <tr key={row.invoiceNo}>
                    <td>{row.invoiceNo}</td>
                    <td>{row.customer}</td>
                    <td>{row.dueDate}</td>
                    <td>{row.amount}</td>
                    <td>
                      <span className={statusClass(row.status)}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2>Inventory Table</h2>
            <span className="dashboard-muted">Low-stock smart highlights</span>
          </div>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>WH</th>
                  <th>On Hand</th>
                  <th>Reserved</th>
                  <th>Min</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRows.map((row) => (
                  <tr key={row.sku}>
                    <td>{row.sku}</td>
                    <td>{row.name}</td>
                    <td>{row.warehouse}</td>
                    <td>{row.onHand}</td>
                    <td>{row.reserved}</td>
                    <td>{row.min}</td>
                    <td>
                      <span className={statusClass(row.status)}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}
