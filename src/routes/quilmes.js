import express from "express";
const router = express.Router();

//import { isLoggedInncli } from "../lib/auth.js";
import pool from "../database.js";


import bcrypt from "bcryptjs";


router.get("/crear-usuario", async (req, res) => {
  try {
    const usuario = "pipo";
    const nivel = 1;   
    const password = "1234";


    if (!usuario || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email y password son obligatorios"
      });
    }

    // 1️⃣ Verificar si ya existe
    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE usuario = ?",
      [usuario]
    );

    if (existe.length > 0) {
      return res.status(409).json({
        ok: false,
        message: "El usuario ya existe"
      });
    }

    // 2️⃣ Hashear contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3️⃣ Insertar usuario
    const result = await pool.query(
      "INSERT INTO usuarios (nivel, password, usuario) VALUES (?, ?, ?)",
      [nivel, passwordHash, usuario]
    );

    res.status(201).json({
      ok: true,
      message: "Usuario creado",
      userId: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error del servidor"
    });
  }
});




router.post("/agregarsocio", async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      dni,
      genero,
      fecha_nacimiento,
      fecha_ingreso,
      telefono,
      direccion,
      obra_social,
      numero_afiliado,
      email,
      observaciones
    } = req.body;

    // 🔴 VALIDACIÓN OBLIGATORIA
    if (!nombre || !apellido || !dni) {
      return res.status(400).json({
        ok: false,
        message: "Nombre, apellido y DNI son obligatorios"
      });
    }

    const sql = `
      INSERT INTO socios (
        nombre,
        apellido,
        dni,
        genero,
        fecha_nacimiento,
        fecha_ingreso,
        telefono,
        direccion,
    
        email,
        
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      nombre.trim(),
      apellido.trim(),
      dni.trim(),
      genero || null,
      fecha_nacimiento || null,
      fecha_ingreso || null,
      telefono || null,
      direccion || null,
  
      email || null,
    
    ];

    const result = await pool.query(sql, valores);

    res.status(201).json({
      ok: true,
      message: "Socio creado correctamente",
      id_socio: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al crear socio"
    });
  }
});

export default router;