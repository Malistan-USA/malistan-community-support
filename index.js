// User credentials (in a real app, these would be on the server)
const users = {
  admin: { password: "admin123", role: "admin" },
  public: { password: "public123", role: "public" }
};

// App state
let currentUser = null;

// DOM Elements
const loginContainer = document.getElementById("login-container");
const appContainer = document.getElementById("app-container");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const form = document.getElementById("dataForm");
const editForm = document.getElementById("editForm");
const tableBody = document.getElementById("tableBody");
const zoomBody = document.getElementById("zoomBody");
const copyAllBtn = document.getElementById("copyAllBtn");
const sendAllBtn = document.getElementById("sendAllBtn");
const zoomLinkInput = document.getElementById("zoomLink");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  // Check if user is already logged in
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
  }

  // Set up event listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Login handler
  loginForm.addEventListener("submit", handleLogin);

  // Logout handler
  logoutBtn.addEventListener("click", handleLogout);

  // Form submission
  form.addEventListener("submit", handleFormSubmit);
  editForm.addEventListener("submit", handleEditSubmit);

  // Zoom controls
  copyAllBtn.addEventListener("click", handleCopyAll);
  sendAllBtn.addEventListener("click", handleSendAll);

  // Edit cancel button
  cancelEditBtn.addEventListener("click", cancelEdit);
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (users[username] && users[username].password === password) {
    currentUser = {
      username,
      role: users[username].role
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    showApp();
  } else {
    alert("Invalid credentials");
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  loginContainer.style.display = "block";
  appContainer.style.display = "none";
  loginForm.reset();
}

function showApp() {
  loginContainer.style.display = "none";
  appContainer.style.display = "block";
  document.body.className = `role-${currentUser.role}`;
  initApp();
}

function initApp() {
  loadData();
  if (currentUser.role === "admin") {
    loadZoomParticipants();
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  const newEntry = {
    id: Date.now(),
    fullName: document.getElementById("fullName").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    residency: document.getElementById("residency").value,
    career: document.getElementById("career").value,
    joinZoom: document.getElementById("joinZoom").checked,
    createdBy: currentUser.username
  };

  let entries = JSON.parse(localStorage.getItem("userEntries")) || [];
  entries.push(newEntry);
  localStorage.setItem("userEntries", JSON.stringify(entries));

  loadData();
  if (currentUser.role === "admin") {
    loadZoomParticipants();
  }
  form.reset();
}

function handleEditSubmit(e) {
  e.preventDefault();

  const id = parseInt(document.getElementById("editId").value);
  const updatedEntry = {
    id,
    fullName: document.getElementById("editFullName").value,
    phone: document.getElementById("editPhone").value,
    email: document.getElementById("editEmail").value,
    residency: document.getElementById("editResidency").value,
    career: document.getElementById("editCareer").value,
    joinZoom: document.getElementById("editJoinZoom").checked,
    createdBy: currentUser.username
  };

  let entries = JSON.parse(localStorage.getItem("userEntries")) || [];
  entries = entries.filter((entry) => entry.id !== id);
  entries.push(updatedEntry);
  localStorage.setItem("userEntries", JSON.stringify(entries));

  document.getElementById("editFormContainer").style.display = "none";
  document.getElementById("dataForm").style.display = "block";
  loadData();
  if (currentUser.role === "admin") {
    loadZoomParticipants();
  }
}

function cancelEdit() {
  document.getElementById("editFormContainer").style.display = "none";
  document.getElementById("dataForm").style.display = "block";
  document.getElementById("editForm").reset();
}

function loadData() {
  tableBody.innerHTML = "";
  const entries = JSON.parse(localStorage.getItem("userEntries")) || [];

  if (entries.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="7" style="text-align: center;">No data available</td></tr>';
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("tr");
    let actions = "";

    // All users can edit their own entries
    if (entry.createdBy === currentUser.username) {
      actions = `<button class="action-btn edit-btn" data-id="${entry.id}">Edit</button>`;
    }

    // Admins can delete any entry
    if (currentUser.role === "admin") {
      actions += `<button class="action-btn delete-btn" data-id="${entry.id}">Delete</button>`;
    }

    row.innerHTML = `
      <td>${entry.fullName}</td>
      <td>${entry.phone}</td>
      <td><a href="mailto:${entry.email}" class="email-link">${
      entry.email
    }</a></td>
      <td>${entry.residency}</td>
      <td>${entry.career}</td>
      <td>${entry.joinZoom ? "Yes" : "No"}</td>
      <td>${actions}</td>
    `;

    tableBody.appendChild(row);
  });

  // Set up event listeners for dynamically created buttons
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteEntry(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editEntry(parseInt(btn.dataset.id)));
  });
}

function editEntry(id) {
  const entries = JSON.parse(localStorage.getItem("userEntries")) || [];
  const entry = entries.find((entry) => entry.id === id);

  if (entry) {
    document.getElementById("editId").value = entry.id;
    document.getElementById("editFullName").value = entry.fullName;
    document.getElementById("editPhone").value = entry.phone;
    document.getElementById("editEmail").value = entry.email;
    document.getElementById("editResidency").value = entry.residency;
    document.getElementById("editCareer").value = entry.career;
    document.getElementById("editJoinZoom").checked = entry.joinZoom;

    document.getElementById("dataForm").style.display = "none";
    document.getElementById("editFormContainer").style.display = "block";
    document
      .getElementById("editFormContainer")
      .scrollIntoView({ behavior: "smooth" });
  }
}

function deleteEntry(id) {
  let entries = JSON.parse(localStorage.getItem("userEntries")) || [];
  entries = entries.filter((entry) => entry.id !== id);
  localStorage.setItem("userEntries", JSON.stringify(entries));
  loadData();
  if (currentUser.role === "admin") {
    loadZoomParticipants();
  }
}

function loadZoomParticipants() {
  zoomBody.innerHTML = "";
  const entries = JSON.parse(localStorage.getItem("userEntries")) || [];
  const participants = entries.filter((entry) => entry.joinZoom);

  if (participants.length === 0) {
    zoomBody.innerHTML =
      '<tr><td colspan="3" style="text-align: center;">No Zoom participants yet</td></tr>';
    return;
  }

  participants.forEach((participant) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${participant.fullName}</td>
      <td><a href="mailto:${participant.email}" class="email-link">${participant.email}</a></td>
      <td><button class="action-btn remove-btn" data-id="${participant.id}">Remove</button></td>
    `;
    zoomBody.appendChild(row);
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      removeFromZoom(parseInt(btn.dataset.id))
    );
  });
}

function removeFromZoom(id) {
  let entries = JSON.parse(localStorage.getItem("userEntries")) || [];
  const entryIndex = entries.findIndex((entry) => entry.id === id);

  if (entryIndex !== -1) {
    entries[entryIndex].joinZoom = false;
    localStorage.setItem("userEntries", JSON.stringify(entries));
    loadData();
    loadZoomParticipants();
  }
}

async function handleCopyAll() {
  const entries = JSON.parse(localStorage.getItem("userEntries")) || [];
  const participants = entries.filter((entry) => entry.joinZoom);

  if (participants.length === 0) {
    alert("No Zoom participants to copy!");
    return;
  }

  const emails = participants.map((p) => p.email).join(", ");
  const zoomLink = zoomLinkInput.value.trim();
  let textToCopy = emails;

  if (zoomLink) {
    textToCopy = `${emails}\n\nZoom Meeting Link: ${zoomLink}`;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    alert(
      "Zoom participant emails copied to clipboard!" +
        (zoomLink ? "\n\nZoom link included." : "")
    );

    if (zoomLink) {
      copyAllBtn.style.display = "none";
      sendAllBtn.style.display = "inline-block";
    }
  } catch (err) {
    console.error("Failed to copy emails: ", err);
    alert("Failed to copy emails. Please try again.");
  }
}

function handleSendAll() {
  const zoomLink = zoomLinkInput.value.trim();
  if (!zoomLink) {
    alert("Please enter a Zoom link first");
    return;
  }

  const entries = JSON.parse(localStorage.getItem("userEntries")) || [];
  const participants = entries.filter((entry) => entry.joinZoom);

  if (participants.length === 0) {
    alert("No Zoom participants to send to!");
    return;
  }

  const subject = "Zoom Meeting Invitation";
  const bccEmails = participants.map((p) => p.email).join(",");
  const body =
    `Dear Attendees,\n\nYou are invited to join our Zoom meeting.\n\n` +
    `Meeting Link: ${zoomLink}\n\n` +
    `Best regards,\nThe Team`;

  const mailtoLink =
    `mailto:?bcc=${encodeURIComponent(bccEmails)}` +
    `&subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoLink;
  alert(
    `Email client opened with ${participants.length} participants in BCC. Please review and click send to notify everyone.`
  );
}
