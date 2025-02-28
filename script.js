const formular = document.getElementById("formular");
const tabulka = document.getElementById("tabulka").getElementsByTagName("tbody")[0];
const vyhledavani = document.getElementById("vyhledavani");
const URL_GOOGLE_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbwezerwkIqMySE11wk8VnaNbAUee3v_UD8LWRcu0-0EfDBvfsaThn1bc6MowYUc3Zt2/exec";

let smlouvy = JSON.parse(localStorage.getItem("smlouvy")) || [];

function ulozitSmlouvy() {
    localStorage.setItem("smlouvy", JSON.stringify(smlouvy));
    zobrazSmlouvy();
}

function odeslatDataDoGoogleSheets(data) {
    fetch(URL_GOOGLE_APPS_SCRIPT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log("Data odeslána do Google Sheets:", data))
    .catch(error => console.error("Chyba při odesílání dat:", error));
}

smlouvy.forEach((smlouva, index) => {
    if (!smlouva.id) {
        smlouva.id = Date.now() + index;
    }
});

ulozitSmlouvy();

window.onload = function () {
    zobrazSmlouvy();
    odeslatDataDoGoogleSheets(smlouvy);
};

formular.addEventListener("submit", function (event) {
    event.preventDefault();
    const smlouva = {
        id: Date.now(),
        cisloSmlouvy: document.getElementById("cisloSmlouvy").value,
        nazevSmlouvy: document.getElementById("nazevSmlouvy").value,
        cisloAkce: document.getElementById("cisloAkce").value,
        datumUzavreni: document.getElementById("datumUzavreni").value,
        datumPlatnosti: document.getElementById("datumPlatnosti").value,
        tdi: document.getElementById("tdi").value,
        email: document.getElementById("email").value
    };
    if (!smlouva.cisloSmlouvy || !smlouva.nazevSmlouvy || !smlouva.datumPlatnosti || !smlouva.email) {
        alert("Vyplňte všechna povinná pole!");
        return;
    }
    smlouvy.push(smlouva);
    ulozitSmlouvy();
    formular.reset();
    odeslatDataDoGoogleSheets(smlouva);
});

function zobrazSmlouvy(filteredSmlouvy = null) {
    tabulka.innerHTML = "";
    let data = filteredSmlouvy || JSON.parse(localStorage.getItem("smlouvy")) || [];
    if (data.length === 0) {
        tabulka.innerHTML = "<tr><td colspan='8' style='text-align:center;'>Žádné smlouvy nejsou k dispozici</td></tr>";
        return;
    }
    data.sort((a, b) => new Date(a.datumPlatnosti) - new Date(b.datumPlatnosti));
    data.forEach(smlouva => {
        const novaRadka = tabulka.insertRow();
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
