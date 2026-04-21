// ------------------------------
// Firebase
// ------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 POSA AQUÍ EL TEU firebaseConfig EXACTE
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
// Elements del DOM
// ------------------------------
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatStatusEl = document.getElementById("chatStatus");

const nameModal = document.getElementById("nameModal");
const nameInput = document.getElementById("nameInput");
const nameConfirm = document.getElementById("nameConfirm");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

const profileName = document.getElementById("profileName");
const profileLastSeen = document.getElementById("profileLastSeen");
const profileMessages = document.getElementById("profileMessages");
const profileId = document.getElementById("profileId");
const profileAvatar = document.getElementById("profileAvatar");

console.log("nameConfirm:", nameConfirm);
console.log("nameModal:", nameModal);
console.log("nameInput:", nameInput);


// ------------------------------
// Usuari local
// ------------------------------
let user = JSON.parse(localStorage.getItem("ethosUser")) || null;

// ------------------------------
// Mostrar modal si no hi ha usuari
// ------------------------------
if (!user) {
  nameModal.classList.remove("hidden");
}

// ------------------------------
// Confirmar nom
// ------------------------------
nameConfirm.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) return;

  user = {
    name,
    internalId: crypto.randomUUID(),
    createdAt: Date.now(),
    lastSeen: Date.now(),
    messagesSent: 0,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
  };

  localStorage.setItem("ethosUser", JSON.stringify(user));
  nameModal.classList.add("hidden");
  updateProfileUI();
});

// ------------------------------
// Actualitzar perfil
// ------------------------------
function updateProfileUI() {
  if (!user) return;
  profileName.textContent = user.name;
  profileLastSeen.textContent = new Date(user.lastSeen).toLocaleString();
  profileMessages.textContent = user.messagesSent;
  profileId.textContent = user.internalId;
  profileAvatar.src = user.avatar;
}

updateProfileUI();

// ------------------------------
// Enviar missatge
// ------------------------------
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || !user) return;

  await addDoc(collection(db, "messages"), {
    user: user.name,
    text,
    createdAt: serverTimestamp()
  });

  user.messagesSent++;
  user.lastSeen = Date.now();
  localStorage.setItem("ethosUser", JSON.stringify(user));
  updateProfileUI();

  chatInput.value = "";
}

chatSend.addEventListener("click", sendMessage);
nameConfirm.addEventListener("click", () => {
  console.log("CLICK DETECTAT");
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ------------------------------
// Rebre missatges en temps real
// ------------------------------
const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

onSnapshot(
  q,
  (snapshot) => {
    chatStatusEl.textContent = "● Online";
    chatStatusEl.classList.remove("offline");
    chatStatusEl.classList.add("online");

    chatMessages.innerHTML = "";

    snapshot.forEach((doc) => {
      const msg = doc.data();
      const li = document.createElement("li");
      li.classList.add("chat-message");

      li.innerHTML = `
        <strong>${msg.user}:</strong> ${msg.text}
      `;

      chatMessages.appendChild(li);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  },
  () => {
    chatStatusEl.textContent = "● Offline";
    chatStatusEl.classList.remove("online");
    chatStatusEl.classList.add("offline");
  }
);

// ------------------------------
// Settings
// ------------------------------
settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.remove("hidden");
});

closeSettings.addEventListener("click", () => {
  settingsPanel.classList.add("hidden");
});
