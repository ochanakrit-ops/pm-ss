const path = require("path");
const express = require("express");
const cors = require("cors");

const { initDb } = require("./src/db");
const { authRouter } = require("./src/routes/auth");
const { apiRouter } = require("./src/routes/api");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

initDb();

app.use("/api", authRouter);
app.use("/api", apiRouter);

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`PM-SS running on http://localhost:${PORT}`));
