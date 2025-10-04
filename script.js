const API_URL = "https://shop-logs-backend-1.onrender.com/api/logs"; // Replace with your Render backend

function formatTime(timeStr) {
  let [hours, minutes] = timeStr.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

async function fetchLogs() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    ["PS1","PS2","PS3","PC1"].forEach(device => {
      document.getElementById(`${device}-logs`).innerHTML = "";
    });

    if (!Array.isArray(data)) return;

    data.forEach(log => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Total: ${log.totalPayment}</strong><br>
        Start: ${formatTime(log.startTime)}<br>
        End: ${formatTime(log.endTime)}<br>
        Controllers: ${log.controllers}<br>
        Cash: ${log.cash || ""}<br>
        Online: ${log.online || ""}
        <div class="actions">
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </div>
      `;

      // Edit button (UI only, functionality will call backend later)
      li.querySelector(".edit").addEventListener("click", () => {
        const newStart = prompt("Edit Start Time (HH:MM)", log.startTime);
        const newEnd = prompt("Edit End Time (HH:MM)", log.endTime);
        const newControllers = prompt("Edit Controllers", log.controllers);
        const newTotal = prompt("Edit Total Payment", log.totalPayment);
        const newCash = prompt("Edit Cash", log.cash);
        const newOnline = prompt("Edit Online", log.online);

        // For now, we update UI only, backend PUT will be implemented later
        log.startTime = newStart || log.startTime;
        log.endTime = newEnd || log.endTime;
        log.controllers = newControllers || log.controllers;
        log.totalPayment = newTotal || log.totalPayment;
        log.cash = newCash || log.cash;
        log.online = newOnline || log.online;
        fetchLogs();
      });

      // Delete button (UI only, backend DELETE later)
      li.querySelector(".delete").addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this log?")) {
          // Backend call to delete will be implemented later
          li.remove();
        }
      });

      const ul = document.getElementById(`${log.device}-logs`);
      if (ul) ul.appendChild(li);
    });

  } catch (err) {
    console.error("Failed to fetch logs:", err);
  }
}

document.getElementById("logForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const log = {
    device: document.getElementById("device").value,
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value,
    controllers: Number(document.getElementById("controllers").value),
    totalPayment: Number(document.getElementById("totalPayment").value),
    cash: Number(document.getElementById("cash").value) || 0,
    online: Number(document.getElementById("online").value) || 0
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(log)
    });
    document.getElementById("logForm").reset();
    fetchLogs();
  } catch (err) {
    console.error("Failed to add log:", err);
  }
});

// Reset button
document.getElementById("resetBtn").addEventListener("click", () => {
  const pin = prompt("Enter admin PIN to reset logs");
  if (pin) {
    alert("Backend reset not implemented yet"); // placeholder
  }
});

// WhatsApp Button
document.getElementById("whatsappBtn").addEventListener("click", () => {
  const rows = [];
  ["PS1","PS2","PS3","PC1"].forEach(device => {
    const logs = document.getElementById(`${device}-logs`).children;
    for (let li of logs) {
      const text = li.textContent.replace(/\n/g, " ").replace("Total: ", "");
      rows.push(`${device} ${text}`);
    }
  });
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  const message = `${dateStr}\n${rows.join("\n")}`;
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});

fetchLogs();
