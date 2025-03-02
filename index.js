const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyD13zrD75Ri2jV6--COrlHa59my30xxx-yZeFyFmnRZPcEBB-Z8kICQXkTwGNbaurL/exec";

app.post("/", async (req, res) => {
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Chyba při odesílání na Google Apps Script" });
    }
});

module.exports = app;
