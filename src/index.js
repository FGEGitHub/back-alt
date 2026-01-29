import express from "express";
import morgan from "morgan";
import path from "path";
import flash from "connect-flash";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { fileURLToPath } from "url";

// ==============================
// __dirname en ESM
// ==============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================
// Passport config
// ==============================
import "./lib/passport.js";

// ==============================
// App init
// ==============================
const app = express();
const PUERTO = 4000;

app.set("port", PUERTO);
app.set("view engine", ".hbs");

// ==============================
// Middlewares (ORDEN IMPORTANTE)
// ==============================

// 1. Sesión
app.use(session({
  secret: "tu_secreto_super_seguro",
  resave: false,
  saveUninitialized: false
}));

// 2. Passport
app.use(passport.initialize());
app.use(passport.session());

// 3. Flash
app.use(flash());

// 4. Logs y parsers
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 5. Archivos estáticos extra
app.use("/imagenesvendedoras", express.static("imagenesvendedoras"));

// ==============================
// CORS
// ==============================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ==============================
// Routes
// ==============================
import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/authentication.js";
import dtcRoutes from "./routes/quilmes.js";

app.use(indexRoutes);
app.use(authRoutes);
app.use("/quilmes", dtcRoutes);

// ==============================
// Public
// ==============================
app.use(express.static(path.join(__dirname, "public")));

// ==============================
// Start server
// ==============================
app.listen(app.get("port"), () => {
  console.log("✅ Server on port", app.get("port"));
});
