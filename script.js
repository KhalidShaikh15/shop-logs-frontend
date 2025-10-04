const API_URL = "https://shop-logs-backend-1.onrender.com/api/logs";

// Elements
const logForm = document.getElementById("logForm");
const playerInput = document.getElementById("player");
const scoreInput = document.getElementById("score");
const logsList = document.getElementById("logs");

// Fetch and display logs
async function fetchLogs() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    logsList.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      logsList.innerHTML = "<li>No logs yet</li>";
      return;
    }

    data.forEach(log => {
      const li = document.createElement("li");
      li.textContent = `${log.player} scored ${log.score} (at ${new Date(log.createdAt).toLocaleString()})`;

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.style.marginLeft = "10px";
      editBtn.onclick = () => editLog(log);

      li.appendChild(editBtn);
      logsList.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching logs:", err);
    logsList.innerHTML = "<li>Error loading logs</li>";
  }
}

// Add new log
logForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const player = playerInput.value.trim();
  const score = Number(scoreInput.value);

  if (!player || isNaN(score)) {
    alert("Please enter a valid player and score");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player, score })
    });

    const data = await res.json();
    if (!data.success) {
      alert("Failed to add log");
    } else {
      playerInput.value = "";
      scoreInput.value = "";
      fetchLogs();
    }
  } catch (err) {
    console.error("Add log error:", err);
    alert("Error adding log");
  }
});

// Edit a log
async function editLog(log) {
  const newPlayer = prompt("Enter new player name:", log.player);
  const newScore = prompt("Enter new score:", log.score);

  if (!newPlayer || isNaN(Number(newScore))) return;

  try {
    const res = await fetch(`${API_URL}/${log._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player: newPlayer, score: Number(newScore) })
    });

    const data = await res.json();
    if (data.success) fetchLogs();
    else alert("Failed to update log");
  } catch (err) {
    console.error("Edit log error:", err);
    alert("Error editing log");
  }
}

// Reset all logs
async function resetLogs() {
  if (!confirm("Are you sure you want to delete all logs?")) return;

  try {
    const res = await fetch(`${API_URL}/reset`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchLogs();
    else alert("Failed to reset logs");
  } catch (err) {
    console.error("Reset logs error:", err);
    alert("Error resetting logs");
  }
}

// Optional: add a reset button dynamically
const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset All Logs";
resetBtn.style.display = "block";
resetBtn.style.marginTop = "10px";
resetBtn.onclick = resetLogs;
document.body.insertBefore(resetBtn, logsList);

// Initial fetch
fetchLogs();
