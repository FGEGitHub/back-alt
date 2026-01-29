import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import pool from "../database.js";
import helpers from "../lib/helpers.js";

// =======================
// SIGNUP
// =======================
passport.use('local.signup', new LocalStrategy({
    usernameField: 'usuario',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, usuario, password, done) => {

    let { nombre, mail, tel, nivel } = req.body;
    if (!nivel) nivel = 1;

    const newUser = { usuario, nombre, tel, mail, nivel };

    try {
        const verif = await pool.query(
            'SELECT * FROM usuarios WHERE usuario = ?', [usuario]
        );

        if (verif.length > 0) {
            return done(null, false, req.flash('message', 'Usuario existente'));
        }

        newUser.password = await helpers.encryptPassword(password);

        const result = await pool.query(
            'INSERT INTO usuarios (password, usuario, nombre, tel, mail, nivel) VALUES (?, ?, ?, ?, ?, ?)',
            [newUser.password, usuario, nombre, tel, mail, nivel]
        );

        newUser.id = result.insertId;
        return done(null, newUser);

    } catch (error) {
        console.log(error);
        return done(error);
    }
}));

// =======================
// SIGNIN
// =======================
passport.use('local.signin', new LocalStrategy({
    usernameField: 'usuario',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, usuario, password, done) => {

    try {
        const rows = await pool.query(
            'SELECT * FROM usuarios WHERE usuario = ?', [usuario]
        );

        if (rows.length === 0) {
            return done(null, false, req.flash('message', 'Usuario no existe'));
        }

        const user = rows[0];

        const validPassword = await helpers.matchPassword(password, user.password);

        if (!validPassword) {
            return done(null, false, req.flash('message', 'Password incorrecta'));
        }

        return done(null, user, req.flash('success', 'Bienvenido'));

    } catch (error) {
        console.log(error);
        return done(error);
    }
}));

// =======================
// SESSION HANDLERS
// =======================
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query(
        'SELECT * FROM usuarios WHERE id = ?', [id]
    );
    done(null, rows[0]);
});
