// 🔐 LOGIN SYSTEM
function openLogin() {
  document.getElementById("loginPopup").style.display = "flex";
}

function closeLogin() {
  document.getElementById("loginPopup").style.display = "none";
}

function login() {
  let email = document.getElementById("email").value;
  let pass = document.getElementById("pass").value;

  firebase.auth().signInWithEmailAndPassword(email, pass)
    .then(() => {
      alert("Login Successful ✅");
      checkAdmin();
    })
    .catch(err => alert(err.message));
}

// 🔥 ADMIN CHECK
let isAdmin = false;

function checkAdmin() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // 👉 Apna email yaha daalo (IMPORTANT)
      if (user.email === "editerramesh97@gmail.com") {
        isAdmin = true;
        console.log("Admin Login ✅");
      } else {
        isAdmin = false;
      }
    }
    loadMusic();
  });
}

// 🎵 DASHBOARD
function openDashboard() {
  if (!isAdmin) {
    alert("Access Denied ❌");
    return;
  }
  document.getElementById("dashboardSection").style.display = "block";
}

function closeDashboard() {
  document.getElementById("dashboardSection").style.display = "none";
}

// 🔥 UPLOAD MUSIC (SECURE)
async function uploadMusic() {

  if (!isAdmin) {
    alert("Only Admin Allowed ❌");
    return;
  }

  const title = document.getElementById("title").value;
  const url = document.getElementById("songUrl").value;
  const category = document.getElementById("category").value;

  if (!title || !url) {
    alert("Sab fill karo!");
    return;
  }

  try {
    await db.collection("SONG").add({
      title,
      url,
      category
    });

    alert("Upload ho gaya 🎵🔥");

    loadMusic();

  } catch (e) {
    alert("Error ❌");
  }
}

// 🎵 LOAD MUSIC
async function loadMusic() {

  const dummy = document.getElementById("dummyList");
  const track = document.getElementById("trackList");
  const full = document.getElementById("fullList");

  dummy.innerHTML = "";
  track.innerHTML = "";
  full.innerHTML = "";

  const snapshot = await db.collection("SONG").get();

  snapshot.forEach(doc => {
    const data = doc.data();
    const id = doc.id;

    const audioId = "audio_" + id;

    const div = document.createElement("div");
    div.className = "beat-card";

    div.innerHTML = `
      <h4>${data.title}</h4>

      <audio id="${audioId}">
        <source src="${data.url}" type="audio/mpeg">
      </audio>

      <button onclick="togglePlay('${audioId}')">▶️</button>

      ${
        isAdmin
          ? `<button onclick="deleteSong('${id}')">🗑 Delete</button>`
          : ""
      }
    `;

    if (data.category === "dummy") {
      dummy.appendChild(div);
    } else if (data.category === "track") {
      track.appendChild(div);
    } else {
      full.appendChild(div);
    }
  });
}

// 🗑 DELETE SONG (SECURE)
async function deleteSong(id) {

  if (!isAdmin) {
    alert("Access Denied ❌");
    return;
  }

  const confirmDelete = confirm("Delete karna hai?");
  if (!confirmDelete) return;

  await db.collection("SONG").doc(id).delete();
  alert("Deleted ✅");
  loadMusic();
}

// 🎧 PLAYER
let currentAudio = null;

function togglePlay(audioId) {
  const audio = document.getElementById(audioId);

  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
  }

  if (audio.paused) {
    audio.play();
    currentAudio = audio;
  } else {
    audio.pause();
  }
}

// AUTO LOAD
window.onload = () => {
  checkAdmin();
};