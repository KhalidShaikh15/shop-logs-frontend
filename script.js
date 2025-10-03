const API_URL = "https://shop-logs-backend-1.onrender.com/"; // your Render backend

// Elements
const logForm = document.getElementById("log-form");
const logsTableBody = document.getElementById("logs-table-body");
const generateBtn = document.getElementById("generate-whatsapp");
const resetBtn = document.getElementById("reset-logs");

// Store logs locally in memory for WhatsApp generation
let logs = [];

// Format date to DD/MM/YYYY
function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Fetch logs from backend
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
      <td>${log.station}</td>
      <td>${log.startTime || "-"}</td>
      <td>${log.endTime || "-"}</td>
      <td>${log.controllers || "-"}</td>
      <td>${log.duration || "-"}</td>
      <td>${log.amount || "-"}</td>
      <td>${log.cash || 0}</td>
      <td>${log.online || 0}</td>
      <td>
        <button onclick="editLog('${log._id}')">✏️ Edit</button>
      </td>
    `;
    logsTableBody.appendChild(row);
  });
}

// Add log entry
logForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(logForm);
  const log = {
    date: new Date().toISOString(),
    station: formData.get("station"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    controllers: formData.get("controllers"),
    duration: formData.get("duration"),
    amount: formData.get("amount"),
    cash: formData.get("cash"),
    online: formData.get("online"),
  };

  await fetch(`${API_URL}/add-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });

  logForm.reset();
  fetchLogs();
});

// Edit log
async function editLog(id) {
  const log = logs.find((l) => l._id === id);
  if (!log) return;

  const newAmount = prompt("Enter new amount:", log.amount);
  if (newAmount !== null) {
    log.amount = newAmount;

    await fetch(`${API_URL}/edit-log/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });

    fetchLogs();
  }
}

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

  let message = `${formatDate(new Date())}\n\n`;
  logs.forEach((log) => {
    message += `${log.station} ${log.startTime || ""}-${log.endTime || ""} - ${log.controllers} controllers - ${log.duration} - ${log.amount} (${log.online} online, ${log.cash} cash)\n`;
  });

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
});

// Load logs on start
fetchLogs();
