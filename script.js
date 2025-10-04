const API_URL = "https://shop-logs-backend-1.onrender.com/api"; // Your Render backend

// Helper: Convert 24h to 12h AM/PM
function formatTime12h(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

// Fetch and display logs
async function fetchLogs() {
  try {
    const res = await fetch(`${API_URL}/logs`);
    const data = await res.json();
    const logsList = document.getElementById("logs");
    logsList.innerHTML = "";

    if (!Array.isArray(data)) return;

    data.forEach(log => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${log.device}</td>
        <td>${formatTime12h(log.startTime)}</td>
        <td>${formatTime12h(log.endTime)}</td>
        <td>${log.controllers}</td>
        <td>${log.totalPayment}</td>
        <td>${log.cash || ""}</td>
        <td>${log.online || ""}</td>
        <td>
          <button class="action-btn edit-btn" onclick='editLog("${log._id}")'>Edit</button>
          <button class="action-btn delete-btn" onclick='deleteLog("${log._id}")'>Delete</button>
        </td>
      `;
      logsList.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to fetch logs:", err);
  }
}

// Add or update log
document.getElementById("logForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const device = document.getElementById("device").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const controllers = Number(document.getElementById("controllers").value);
  const totalPayment = Number(document.getElementById("totalPayment").value);
  const cash = Number(document.getElementById("cash").value) || 0;
  const online = Number(document.getElementById("online").value) || 0;

  const payload = { device, startTime, endTime, controllers, totalPayment, cash, online };

  try {
    await fetch(`${API_URL}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    e.target.reset();
    fetchLogs();
  } catch (err) {
    console.error("Failed to add log:", err);
  }
});

// Delete log with confirmation
async function deleteLog(id) {
  if (!confirm("Are you sure you want to delete this log?")) return;
  try {
    await fetch(`${API_URL}/logs/${id}`, { method: "DELETE" });
    fetchLogs();
  } catch (err) {
    console.error("Failed to delete log:", err);
  }
}

// Edit log
async function editLog(id) {
  try {
    const res = await fetch(`${API_URL}/logs/${id}`);
    const log = await res.json();

    document.getElementById("device").value = log.device;
    document.getElementById("startTime").value = log.startTime;
    document.getElementById("endTime").value = log.endTime;
    document.getElementById("controllers").value = log.controllers;
    document.getElementById("totalPayment").value = log.totalPayment;
    document.getElementById("cash").value = log.cash || "";
    document.getElementById("online").value = log.online || "";

    // Replace submit to update
    const form = document.getElementById("logForm");
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_URL}/logs/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device: document.getElementById("device").value,
            startTime: document.getElementById("startTime").value,
            endTime: document.getElementById("endTime").value,
            controllers: Number(document.getElementById("controllers").value),
            totalPayment: Number(document.getElementById("totalPayment").value),
            cash: Number(document.getElementById("cash").value) || 0,
            online: Number(document.getElementById("online").value) || 0
          })
        });
        form.reset();
        fetchLogs();
        // Restore default submit behavior
        form.onsubmit = null;
      } catch (err) {
        console.error("Failed to update log:", err);
      }
    };
  } catch (err) {
    console.error("Failed to fetch log for edit:", err);
  }
}

// Reset logs (admin PIN required)
async function resetLogs() {
  const pin = prompt("Enter admin PIN to reset logs:");
  if (pin !== "1526") { alert("Incorrect PIN!"); return; }
  try {
    await fetch(`${API_URL}/reset-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin })
    });
    fetchLogs();
    alert("Logs reset successfully!");
  } catch (err) {
    console.error("Failed to reset logs:", err);
  }
}

// Generate WhatsApp draft
function generateWhatsAppMessage() {
  const rows = document.querySelectorAll("#logs tr");
  if (rows.length === 0) { alert("No logs to send"); return; }

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", { day: "numeric", month: "long" });

  let msg = `${dateStr}\n`;

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const device = cells[0].textContent;
    const start = cells[1].textContent;
    const end = cells[2].textContent;
    const controllers = cells[3].textContent;
    const total = cells[4].textContent;
    const cash = cells[5].textContent || "0";
    const online = cells[6].textContent || "0";

    msg += `${device} ${start} to ${end} -${controllers}- ${total}rs(${online}online,${cash}cash)\n`;
  });

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(whatsappUrl, "_blank");
}

// Initial fetch
fetchLogs();
