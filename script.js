// 🔐 CURRENT USER TRACK
let currentUser = null;

// 🔐 ADMIN EMAIL
const ADMIN_EMAIL = "editorramesh97@gmail.com";

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
    .then((userCredential) => {
      currentUser = userCredential.user;
      alert("Login Successful ✅");
      closeLogin();
      // ❌ loadMusic हटाया (important fix)
    })
    .catch(err => alert(err.message));
}

function signup() {
  let email = document.getElementById("email").value;
  let pass = document.getElementById("pass").value;

  firebase.auth().createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Account Created ✅"))
    .catch(err => alert(err.message));
}

// 🔐 ADMIN CHECK (SAFE)
function isAdmin() {
  return currentUser &&
    currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// 🎵 DASHBOARD
function openDashboard() {
  if (!isAdmin()) {
    alert("Access Denied ❌");
    return;
  }
  document.getElementById("dashboardSection").style.display = "block";
}

function closeDashboard() {
  document.getElementById("dashboardSection").style.display = "none";
}

// 🎵 MUSIC POPUP
function openMusic() {
  document.getElementById("musicPopup").style.display = "block";
  loadMusic();
}

function closeMusic() {
  document.getElementById("musicPopup").style.display = "none";
}

// 🔥 UPLOAD MUSIC
async function uploadMusic() {
  if (!isAdmin()) {
    alert("Access Denied ❌");
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

    document.getElementById("title").value = "";
    document.getElementById("songUrl").value = "";

    loadMusic();

  } catch (e) {
    console.error(e);
    alert("Error hua ❌");
  }
}

// 🎵 LOAD MUSIC (AUTO NUMBERING + ADMIN FIX)
async function loadMusic() {

  const dummy = document.getElementById("dummyList");
  const track = document.getElementById("trackList");
  const full = document.getElementById("fullList");

  if (!dummy || !track || !full) return;

  dummy.innerHTML = "";
  track.innerHTML = "";
  full.innerHTML = "";

  // 🔥 AUTO COUNTERS
  let dCount = 1;
  let tCount = 1;
  let fCount = 1;

  try {
    const snapshot = await db.collection("SONG").get();

    snapshot.forEach(doc => {
      const data = doc.data();
      const id = doc.id;

      const audioId = "audio_" + id;

      // 🔢 AUTO NUMBER
      let number = "";
      if (data.category === "dummy") {
        number = dCount++;
      } else if (data.category === "track") {
        number = tCount++;
      } else {
        number = fCount++;
      }

      const div = document.createElement("div");
      div.className = "beat-card";

      div.innerHTML = `
        <h4>${number}. ${data.title}</h4>

        <audio id="${audioId}">
          <source src="${data.url}" type="audio/mpeg">
        </audio>

        <div class="player-controls">
          <button onclick="backward('${audioId}')">⏪</button>
          <button onclick="togglePlay('${audioId}')">▶️</button>
          <button onclick="forward('${audioId}')">⏩</button>
        </div>

        <input type="range" min="0" max="1" step="0.1" value="1"
          onchange="changeVolume('${audioId}', this.value)">

        <a href="${data.url}" download>
          <button class="download">⬇ Download</button>
        </a>

        <div class="btn-group">
          ${data.category === "track" ? `
            <a href="https://wa.me/916207861198?text=Hello%20I%20want%20to%20buy%20${data.title}">
              <button class="buy">💰 Buy</button>
            </a>
          ` : ""}

          ${isAdmin() ? `
            <button class="delete" onclick="deleteSong('${id}')">🗑 Delete</button>
          ` : ""}
        </div>

        <hr>
      `;

      if (data.category === "dummy") {
        dummy.appendChild(div);
      } else if (data.category === "track") {
        track.appendChild(div);
      } else {
        full.appendChild(div);
      }
    });

  } catch (error) {
    console.error(error);
    alert("Load error ❌");
  }
}

// 🗑 DELETE
async function deleteSong(id) {
  if (!isAdmin()) {
    alert("Access Denied ❌");
    return;
  }

  const confirmDelete = confirm("Delete karna hai?");
  if (!confirmDelete) return;

  try {
    await db.collection("SONG").doc(id).delete();
    alert("Deleted ✅");
    loadMusic();
  } catch (e) {
    console.error(e);
    alert("Delete error ❌");
  }
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

function changeVolume(audioId, value) {
  document.getElementById(audioId).volume = value;
}

function forward(audioId) {
  document.getElementById(audioId).currentTime += 10;
}

function backward(audioId) {
  document.getElementById(audioId).currentTime -= 10;
}

// 🔥 AUTO AUTH CHECK (MAIN FIX)
firebase.auth().onAuthStateChanged(user => {
  currentUser = user;
  loadMusic();
});