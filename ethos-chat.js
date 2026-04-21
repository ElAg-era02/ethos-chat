// ------------------------------
// ethos-chat.js
// ------------------------------
nameConfirm.addEventListener("click", () => {
  console.log("CLICK DETECTAT");

  const name = nameInput.value.trim();
  if (!name) return;

  // Crear usuari sense res que pugui petar
  user = {
    name,
    internalId: Math.random().toString(36).substring(2, 12),
    createdAt: Date.now(),
    lastSeen: Date.now(),
    messagesSent: 0,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
  };

  // Guardar usuari
  localStorage.setItem("ethosUser", JSON.stringify(user));

  // Actualitzar UI
  updateProfileUI();

  // Tancar modal
  nameModal.classList.add("hidden");
});
