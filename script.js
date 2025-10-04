const API_URL = "https://shop-logs-backend-1.onrender.com/api/logs"; // Render backend URL

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

// Initial fetch
fetchLogs();
