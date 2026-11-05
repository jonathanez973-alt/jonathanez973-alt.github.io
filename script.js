// Photos (optionnelles) pour certaines villes
const photos = {
  "Cayenne": "images/cayenne.jpg",
  "Paris": "images/paris.jpg",
  "Londres": "images/londres.jpg",
  "New York": "images/newyork.jpg",
  "Tokyo": "images/tokyo.jpg",
  "Dubai": "images/dubai.jpg"
};

// Villes affichées au départ
let affichees = [
  { nom: "Cayenne", fuseau: "America/Cayenne", pays: "gf" },
  { nom: "Paris", fuseau: "Europe/Paris", pays: "fr" },
  { nom: "Londres", fuseau: "Europe/London", pays: "gb" },
  { nom: "New York", fuseau: "America/New_York", pays: "us" },
  { nom: "Tokyo", fuseau: "Asia/Tokyo", pays: "jp" }
];

// Calcule le décalage UTC d'un fuseau (ex : "UTC+2")
function decalage(fuseau) {
  const parties = new Intl.DateTimeFormat("en-US", {
    timeZone: fuseau,
    timeZoneName: "shortOffset"
  }).formatToParts(new Date());
  const valeur = parties.find(p => p.type === "timeZoneName").value;
  return valeur.replace("GMT", "UTC");
}

// Affiche la grande horloge et toutes les cartes
function afficher() {
  const maintenant = new Date();

  document.getElementById("grande-heure").textContent =
    maintenant.toLocaleTimeString("fr-FR");
  document.getElementById("grande-date").textContent =
    maintenant.toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

  let html = "";
  affichees.forEach((v, i) => {
    const heure = maintenant.toLocaleTimeString("fr-FR", {
      timeZone: v.fuseau, hour: "2-digit", minute: "2-digit"
    });
    const date = maintenant.toLocaleDateString("fr-FR", {
      timeZone: v.fuseau, weekday: "short", day: "numeric", month: "short"
    });
    const photo = photos[v.nom] ? `url('${photos[v.nom]}'),` : "";
    const drapeau = v.pays
      ? `<img src="https://flagcdn.com/w40/${v.pays}.png" alt="">`
      : "";
    html += `
      <div class="carte" style="background-image:
        linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.65)),
        ${photo}
        linear-gradient(135deg, #1e3a8a, #0f172a);">
        <button class="supprimer" onclick="supprimer(${i})">✕</button>
        <div class="ville">${drapeau} ${v.nom}</div>
        <div class="heure">${heure}</div>
        <div class="date">${date}</div>
        <div class="utc">${decalage(v.fuseau)}</div>
      </div>`;
  });
  document.getElementById("cartes").innerHTML = html;
}

// Supprime une ville de la liste
function supprimer(i) {
  affichees.splice(i, 1);
  afficher();
}

// Cherche une ville tapée par l'utilisateur et l'ajoute
async function ajouterVille() {
  const saisie = document.getElementById("saisie");
  const message = document.getElementById("message");
  const texte = saisie.value.trim();
  if (texte === "") return;

  message.textContent = "Recherche...";
  try {
    const url = "https://geocoding-api.open-meteo.com/v1/search?name="
      + encodeURIComponent(texte) + "&count=1&language=fr";
    const reponse = await fetch(url);
    const data = await reponse.json();

    if (!data.results) {
      message.textContent = "Ville introuvable : " + texte;
      return;
    }

    const r = data.results[0];
    if (affichees.some(v => v.nom === r.name)) {
      message.textContent = r.name + " est déjà affichée.";
      return;
    }

    affichees.push({
      nom: r.name,
      fuseau: r.timezone,
      pays: (r.country_code || "").toLowerCase()
    });
    message.textContent = r.name + " ajoutée !";
    saisie.value = "";
    afficher();
  } catch (erreur) {
    message.textContent = "Erreur de connexion, réessaie.";
  }
}

document.getElementById("btn-ajouter").addEventListener("click", ajouterVille);
document.getElementById("saisie").addEventListener("keydown", (e) => {
  if (e.key === "Enter") ajouterVille();
});

afficher();
setInterval(afficher, 1000);