const formular = document.getElementById("formular");
const tabulka = document.getElementById("tabulka").getElementsByTagName("tbody")[0];
const vyhledavani = document.getElementById("vyhledavani");

let smlouvy = JSON.parse(localStorage.getItem("smlouvy")) || [];

// Uloží smlouvy do localStorage a obnoví zobrazení
function ulozitSmlouvy() {
    localStorage.setItem("smlouvy", JSON.stringify(smlouvy));
    zobrazSmlouvy();
}

// Přidání smlouvy
formular.addEventListener("submit", function (event) {
    event.preventDefault();

    const cisloSmlouvy = document.getElementById("cisloSmlouvy").value;
    const nazevSmlouvy = document.getElementById("nazevSmlouvy").value;
    const cisloAkce = document.getElementById("cisloAkce").value;
    const datumUzavreni = document.getElementById("datumUzavreni").value;
    const datumPlatnosti = document.getElementById("datumPlatnosti").value;
    const tdi = document.getElementById("tdi").value;
    const email = document.getElementById("email").value;

    if (!cisloSmlouvy || !nazevSmlouvy || !datumPlatnosti || !email) {
        alert("Vyplňte všechna povinná pole!");
        return;
    }

    const smlouva = {
        id: Date.now(),
        cisloSmlouvy,
        nazevSmlouvy,
        cisloAkce,
        datumUzavreni,
        datumPlatnosti,
        tdi,
        email
    };

    smlouvy.push(smlouva);
    ulozitSmlouvy();
    formular.reset();
});

// Mazání smlouvy s potvrzením
function smazatSmlouvu(id) {
    if (confirm("Opravdu chcete smazat tuto smlouvu?")) {
        smlouvy = smlouvy.filter(smlouva => smlouva.id !== id);
        ulozitSmlouvy();
    }
}

// Editace smlouvy (nepřidává kopii, ale upravuje existující)
function editovatSmlouvu(id) {
    const smlouva = smlouvy.find(sml => sml.id === id);
    if (!smlouva) return;

    document.getElementById("cisloSmlouvy").value = smlouva.cisloSmlouvy;
    document.getElementById("nazevSmlouvy").value = smlouva.nazevSmlouvy;
    document.getElementById("cisloAkce").value = smlouva.cisloAkce;
    document.getElementById("datumUzavreni").value = smlouva.datumUzavreni;
    document.getElementById("datumPlatnosti").value = smlouva.datumPlatnosti;
    document.getElementById("tdi").value = smlouva.tdi;
    document.getElementById("email").value = smlouva.email;

    smlouvy = smlouvy.filter(sml => sml.id !== id);
    ulozitSmlouvy();
}

// Fulltextové vyhledávání
vyhledavani.addEventListener("input", function () {
    const filtr = vyhledavani.value.toLowerCase();
    const filtrovaneSmlouvy = smlouvy.filter(smlouva =>
        Object.values(smlouva).some(value => String(value).toLowerCase().includes(filtr))
    );
    zobrazSmlouvy(filtrovaneSmlouvy);
});

// Zobrazení smluv v tabulce s původním barevným zvýrazněním
function zobrazSmlouvy(filteredSmlouvy = null) {
    tabulka.innerHTML = "";
    let data = filteredSmlouvy || smlouvy;

    if (data.length === 0) {
        tabulka.innerHTML = "<tr><td colspan='8' style='text-align:center;'>Žádné smlouvy nejsou k dispozici</td></tr>";
        return;
    }

    const dnes = new Date();
    data.sort((a, b) => new Date(a.datumPlatnosti) - new Date(b.datumPlatnosti));

    data.forEach(smlouva => {
        const platnost = new Date(smlouva.datumPlatnosti);
        const rozdilMesicu = (platnost.getFullYear() - dnes.getFullYear()) * 12 + platnost.getMonth() - dnes.getMonth();

        let trida = "";
        if (platnost < dnes) {
            trida = "expired"; // Červená - smlouva po platnosti
        } else if (rozdilMesicu <= 3) {
            trida = "expiring-soon"; // Oranžová - smlouva vyprší do 3 měsíců
        } else if (rozdilMesicu <= 6) {
            trida = "expiring-medium"; // Žlutá - smlouva vyprší mezi 3 až 6 měsíci
        }

        const novaRadka = tabulka.insertRow();
        novaRadka.className = trida;
        novaRadka.innerHTML = `
            <td>${smlouva.datumPlatnosti}</td>
            <td>${smlouva.cisloSmlouvy}</td>
            <td>${smlouva.nazevSmlouvy}</td>
            <td>${smlouva.cisloAkce}</td>
            <td>${smlouva.datumUzavreni}</td>
            <td>${smlouva.tdi}</td>
            <td>${smlouva.email}</td>
            <td>
                <div style="display: flex; gap: 5px;">
                    <button onclick="editovatSmlouvu(${smlouva.id})">Editovat</button>
                    <button onclick="smazatSmlouvu(${smlouva.id})">Smazat</button>
                </div>
            </td>
        `;
    });
}

// Načtení smluv po spuštění
window.onload = function () {
    zobrazSmlouvy();
};
