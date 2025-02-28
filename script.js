const formular = document.getElementById("formular");
    const tabulka = document.getElementById("tabulka").getElementsByTagName("tbody")[0];
    const vyhledavani = document.getElementById("vyhledavani");
    const URL_GOOGLE_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbwezerwkIqMySE11wk8VnaNbAUee3v_UD8LWRcu0-0EfDBvfsaThn1bc6MowYUc3Zt2/exec";

    let smlouvy = JSON.parse(localStorage.getItem("smlouvy")) || [];

    // Funkce pro uložení smluv do localStorage
    function ulozitSmlouvy() {
        localStorage.setItem("smlouvy", JSON.stringify(smlouvy));
        zobrazSmlouvy();
    }

    // Funkce pro odeslání dat do Google Apps Script
    function odeslatDataDoGoogleSheets(data) {
        fetch(URL_GOOGLE_APPS_SCRIPT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Data odeslána do Google Sheets:", data);
        })
        .catch(error => {
            console.error("Chyba při odesílání dat:", error);
        });
    }

    // Přidání unikátního ID pro každou smlouvu
    smlouvy.forEach((smlouva, index) => {
        if (!smlouva.id) {
            smlouva.id = Date.now() + index;
        }
    });

    ulozitSmlouvy();

    // Načtení dat při spuštění stránky
    window.onload = function () {
        zobrazSmlouvy();
        odeslatDataDoGoogleSheets(smlouvy); // Odeslání dat při načtení stránky
    };

    // FUNKCE PRO PŘIDÁNÍ NOVÉ SMLOUVY
    formular.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Tlačítko Uložit bylo stisknuto.");

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

        odeslatDataDoGoogleSheets(smlouva); // Odeslání dat po přidání smlouvy
    });

    // FUNKCE PRO VYMAZÁNÍ SMLOUVY
    function smazatSmlouvu(id) {
        if (confirm("Opravdu chcete smazat tuto smlouvu?")) {
            smlouvy = smlouvy.filter(smlouva => smlouva.id !== id);
            ulozitSmlouvy();
            odeslatDataDoGoogleSheets(smlouvy); // Odeslání dat po smazání smlouvy
        }
    }

    // FUNKCE PRO EDITACI SMLOUVY
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
        odeslatDataDoGoogleSheets(smlouvy); // Odeslání dat po editaci smlouvy
    }

    // FUNKCE PRO VYHLEDÁVÁNÍ
    vyhledavani.addEventListener("input", function () {
        const filtr = vyhledavani.value.toLowerCase();
        const filtrovaneSmlouvy = smlouvy.filter(smlouva =>
            Object.values(smlouva).some(value => String(value).toLowerCase().includes(filtr))
        );
        zobrazSmlouvy(filtrovaneSmlouvy);
    });

    // FUNKCE PRO ZOBRAZENÍ SMLOUV V TABULCE
    function zobrazSmlouvy(filteredSmlouvy = null) {
        tabulka.innerHTML = "";
        let data = filteredSmlouvy || JSON.parse(localStorage.getItem("smlouvy")) || [];

        if (data.length === 0) {
            tabulka.innerHTML = "<tr><td colspan='8' style='text-align:center;'>Žádné smlouvy nejsou k dispozici</td></tr>";
            return;
        }

        const dnes = new Date();
        data.sort((a, b) => new Date(a.datumPlatnosti) - new Date(b.datumPlatnosti));

        data.forEach(smlouva => {
            const platnost = new Date(smlouva.datumPlatnosti);
            const rozdilMesicu = (platnost.getFullYear() - dnes.getFullYear()) * 12 + platnost.getMonth() - dnes.getMonth();

            const novaRadka = tabulka.insertRow();
            novaRadka.innerHTML = `
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
