console.log("ETHOS CHAT v5 LOADED");

// ------------------------------
// FIREBASE
// ------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpls-yeDmNRoDLq4jXUCKbaiip0A9oXmQ",
  authDomain: "ethos-chat-dfe0e.firebaseapp.com",
  databaseURL: "https://ethos-chat-dfe0e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ethos-chat-dfe0e",
  storageBucket: "ethos-chat-dfe0e.firebasestorage.app",
  messagingSenderId: "1033379402899",
  appId: "1:1033379402899:web:e0a71148c2c1e0a55e2966",
  measurementId: "G-GWK6PBTJV7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ------------------------------
// ELEMENTS HTML
// ------------------------------
const authOverlay = document.getElementById("authOverlay");
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const loginPanel = document.getElementById("loginPanel");
const signupPanel = document.getElementById("signupPanel");

const loginName = document.getElementById("loginName");
const loginPass = document.getElementById("loginPass");
const loginBtn = document.getElementById("loginBtn");

const signupName = document.getElementById("signupName");
const signupPass = document.getElementById("signupPass");
const signupBtn = document.getElementById("signupBtn");

const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearLocal = document.getElementById("clearLocal");

const openProfile = document.getElementById("openProfile");
const closeProfile = document.getElementById("closeProfile");
const profilePanel = document.getElementById("profilePanel");
const profileName = document.getElementById("profileName");
const profileLast = document.getElementById("profileLast");
const profileCount = document.getElementById("profileCount");
const profileId = document.getElementById("profileId");
const themeButtons = document.querySelectorAll(".theme-btn");

// ------------------------------
// ESTAT D'USUARI
// ------------------------------
let user = JSON.parse(localStorage.getItem("ethosUser")) || null;

function updateProfileUI() {
  if (!user) return;
  profileName.textContent = user.name;
  profileLast.textContent = new Date(user.lastSeen).toLocaleString();
  profileCount.textContent = user.messagesSent;
  profileId.textContent = user.internalId;
}

function checkUser() {
  if (!user || !user.name) {
    messageInput.disabled = true;
    messageInput.placeholder = "Inicia sessió per escriure...";
    sendBtn.disabled = true;
  } else {
    messageInput.disabled = false;
    messageInput.placeholder = "Escriu un missatge...";
    sendBtn.disabled = false;
  }
}

updateProfileUI();
checkUser();

// Si no hi ha usuari → mostra popup
if (!user || !user.name) {
  authOverlay.classList.remove("hidden");
} else {
  authOverlay.classList.add("hidden");
}

// ------------------------------
// TABS LOGIN / SIGNUP
// ------------------------------
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  loginPanel.classList.remove("hidden");
  signupPanel.classList.add("hidden");
});

tabSignup.addEventListener("click", () => {
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
  signupPanel.classList.remove("hidden");
  loginPanel.classList.add("hidden");
});

// ------------------------------
// CREAR COMPTE
// ------------------------------
signupBtn.addEventListener("click", async () => {
  const name = signupName.value.trim();
  const pass = signupPass.value.trim();

  if (!name || !pass) {
    alert("Omple nom i contrasenya");
    return;
  }

  const ref = doc(db, "users", name);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    alert("Aquest nom d'usuari ja existeix");
    return;
  }

  const newUser = {
    password: pass, // TEXT PLA (com vols)
    internalId: Math.random().toString(36).substring(2, 12),
    createdAt: Date.now(),
    lastSeen: Date.now(),
    messagesSent: 0
  };

  await setDoc(ref, newUser);

  user = {
    name,
    internalId: newUser.internalId,
    createdAt: newUser.createdAt,
    lastSeen: newUser.lastSeen,
    messagesSent: newUser.messagesSent
  };

  localStorage.setItem("ethosUser", JSON.stringify(user));
  updateProfileUI();
  checkUser();

  authOverlay.classList.add("hidden");
  alert("Compte creat i sessió iniciada!");
});

// ------------------------------
// LOGIN
// ------------------------------
loginBtn.addEventListener("click", async () => {
  const name = loginName.value.trim();
  const pass = loginPass.value.trim();

  if (!name || !pass) {
    alert("Omple nom i contrasenya");
    return;
  }

  const ref = doc(db, "users", name);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Aquest usuari no existeix. Crea un compte.");
    return;
  }

  const data = snap.data();

  if (data.password !== pass) {
    alert("Contrasenya incorrecta");
    return;
  }

  user = {
    name,
    internalId: data.internalId,
    createdAt: data.createdAt,
    lastSeen: Date.now(),
    messagesSent: data.messagesSent || 0
  };

  localStorage.setItem("ethosUser", JSON.stringify(user));
  updateProfileUI();
  checkUser();

  authOverlay.classList.add("hidden");
  alert("Sessió iniciada!");
});

// ------------------------------
// ENVIAR MISSATGE
// ------------------------------
async function sendMessage() {
  if (!user || !user.name) return;

  const text = messageInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    user: user.name,
    text,
    createdAt: serverTimestamp()
  });

  user.messagesSent++;
  user.lastSeen = Date.now();
  localStorage.setItem("ethosUser", JSON.stringify(user));
  updateProfileUI();

  messageInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ------------------------------
// LLEGIR MISSATGES
// ------------------------------
const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

onSnapshot(q, (snapshot) => {
  messagesEl.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const msg = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("message-bubble");
    div.innerHTML = `<span class="msg-user">${msg.user}</span><span class="msg-text">${msg.text}</span>`;
    messagesEl.appendChild(div);
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
});

// ------------------------------
// SETTINGS PANEL
// ------------------------------
openProfile.addEventListener("click", () => {
  profilePanel.classList.toggle("hidden");
});

closeProfile.addEventListener("click", () => {
  profilePanel.classList.add("hidden");
});

// ------------------------------
// CLEAR LOCAL
// ------------------------------
clearLocal.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

// ------------------------------
// TEMES
// ------------------------------
const savedTheme = localStorage.getItem("ethosTheme");
const validThemes = ["ethos_green", "ethos_red", "ethos_blue", "ethos_light"];

if (savedTheme && validThemes.includes(savedTheme)) {
  document.body.classList.remove(
    "theme-ethos_green",
    "theme-ethos_red",
    "theme-ethos_blue",
    "theme-ethos_light"
  );
  document.body.classList.add(`theme-${savedTheme}`);
}

themeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const theme = btn.dataset.theme;

    document.body.classList.remove(
      "theme-ethos_green",
      "theme-ethos_red",
      "theme-ethos_blue",
      "theme-ethos_light"
    );

    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("ethosTheme", theme);
  });
});
