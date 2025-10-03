const API_URL = "https://shop-logs-backend-1.onrender.com"; // your Render backend

// Elements
const logForm = document.getElementById("logForm");
const logsTableBody = document.querySelector("#logTable tbody");
const generateBtn = document.getElementById("generate");
const resetBtn = document.getElementById("reset");

// Store logs locally
let logs = [];

// Format date
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
}

// Fetch logs
async function fetchLogs() {
  const res = await fetch(`${API_URL}/logs`);
  logs = await res.json();
  renderLogs();
}

// Render logs in table
function renderLogs() {
  logsTableBody.innerHTML = "";
  logs.forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(log.date)}</td>
      <td>${log.system}</td>
      <td>${log.start || "-"} - ${log.end || "-"}</td>
      <td>${log.controllers || "-"}</td>
      <td>${log.amount || "-"}</td>
      <td>${log.cash || 0}</td>
      <td>${log.online || 0}</td>
    `;
    logsTableBody.appendChild(row);
  });
}

// Add log
logForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const log = {
    date: new Date().toISOString(),
    system: document.getElementById("system").value,
    start: document.getElementById("start").value,
    end: document.getElementById("end").value,
    controllers: document.getElementById("controllers").value,
    amount: document.getElementById("amount").value,
    cash: document.getElementById("cash").value,
    online: document.getElementById("online").value,
  };

  await fetch(`${API_URL}/add-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });

  logForm.reset();
  fetchLogs();
});

// Reset logs (Admin only)
resetBtn.addEventListener("click", async () => {
  const pin = prompt("Enter admin PIN to reset logs:");
  if (!pin) return;

  const res = await fetch(`${API_URL}/reset-logs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });

  const data = await res.json();
  if (data.success) {
    alert("Logs reset successfully!");
    fetchLogs();
  } else {
    alert("Invalid PIN or reset failed.");
  }
});

// Generate WhatsApp message
generateBtn.addEventListener("click", () => {
  if (logs.length === 0) {
    alert("No logs to generate!");
    return;
  }

  let message = `Gaming Parlour Logs - ${formatDate(new Date())}\n\n`;
  logs.forEach((log) => {
    message += `${log.system} ${log.start}-${log.end} | ${log.controllers} controllers | ₹${log.amount} (Cash: ₹${log.cash}, Online: ₹${log.online})\n`;
  });

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
});

// Load logs
fetchLogs();
