const API_URL = "https://shop-logs-backend-1.onrender.com/api/logs";
const RESET_URL = "https://shop-logs-backend-1.onrender.com/api/reset-logs";
const ADMIN_PIN = "1526"; // ✅ Change admin PIN here if needed

const logForm = document.getElementById("logForm");
const logsContainer = document.getElementById("logs");

// Fetch logs
async function fetchLogs() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    logsContainer.innerHTML = "";

    if (!Array.isArray(data)) return;

    data.forEach(log => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${log.device}</strong> 
        | ${formatTime(log.startTime)} - ${formatTime(log.endTime)} 
        | Controllers: ${log.controllers} 
        | Total: ${log.totalPayment} | Cash: ${log.cash || 0} | Online: ${log.online || 0}
        <button onclick="editLog('${log._id}')">Edit</button>
        <button onclick="deleteLog('${log._id}')">Delete</button>
      `;
      logsContainer.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// Add log
logForm.addEventListener("submit", async e => {
  e.preventDefault();
  const device = document.getElementById("device").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const controllers = document.getElementById("controllers").value;
  const totalPayment = document.getElementById("totalPayment").value;
  const cash = document.getElementById("cash").value;
  const online = document.getElementById("online").value;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device, startTime, endTime, controllers, totalPayment, cash, online })
  });

  logForm.reset();
  fetchLogs();
});

// Delete log
async function deleteLog(id) {
  if (!confirm("Are you sure you want to delete this log?")) return;

  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  fetchLogs();
}

// Edit log
async function editLog(id) {
  const newDevice = prompt("Device name:");
  const newStart = prompt("Start time (hh:mm AM/PM):");
  const newEnd = prompt("End time (hh:mm AM/PM):");
  const newControllers = prompt("Number of controllers:");
  const newTotal = prompt("Total payment:");
  const newCash = prompt("Cash amount:");
  const newOnline = prompt("Online amount:");

  if (!newDevice || !newStart || !newEnd) return;

  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device: newDevice,
      startTime: newStart,
      endTime: newEnd,
      controllers: newControllers,
      totalPayment: newTotal,
      cash: newCash,
      online: newOnline
    })
  });

  fetchLogs();
}

// Reset logs
async function resetLogs() {
  const pin = prompt("Enter admin PIN to reset logs:");
  if (pin !== ADMIN_PIN) return alert("Incorrect PIN");

  await fetch(RESET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin })
  });

  fetchLogs();
}

// Generate WhatsApp message
function generateWhatsAppMessage() {
  let message = "";
  const logs = logsContainer.querySelectorAll("li");
  const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long" });
  message += `${today}\n`;

  logs.forEach(log => {
    const text = log.textContent;
    const parts = text.split("|").map(p => p.trim());
    message += `${parts[0]} ${parts[1]} -${parts[2].split(":")[1]}- ${parts[3]}(${parts[4]},${parts[5]})\n`;
  });

  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// Utility function to format 12-hour time
function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// Initial fetch
fetchLogs();
