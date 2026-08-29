import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { db } from "./db.js";
import { config } from "./config.js";

/*
Création automatique de l'administrateur
--------------------------------------------------------------------------
*/

export async function ensureAdmin() {

if (!config.adminEmail || !config.adminPassword) {

    console.warn(
        "⚠️ ADMIN_EMAIL ou ADMIN_PASSWORD manquant."
    );

    return;
}

const existingAdmin = db
    .prepare(
        `
        SELECT id
        FROM admins
        WHERE email = ?
        `
    )
    .get(config.adminEmail);

if (existingAdmin) {
    return;
}

const passwordHash = await bcrypt.hash(
    config.adminPassword,
    12
);

db.prepare(
    `
    INSERT INTO admins (
        email,
        password_hash
    )
    VALUES (?, ?)
    `
).run(
    config.adminEmail,
    passwordHash
);

console.log(
    `✅ Administrateur créé : ${config.adminEmail}`
);

}

/*
Connexion administrateur
--------------------------------------------------------------------------
*/

export async function loginAdmin(email, password) {

const admin = db
    .prepare(
        `
        SELECT
            id,
            email,
            password_hash
        FROM admins
        WHERE email = ?
        `
    )
    .get(email);

if (!admin) {
    return null;
}

const passwordValid = await bcrypt.compare(
    password,
    admin.password_hash
);

if (!passwordValid) {
    return null;
}

const token = jwt.sign(
    {
        sub: admin.id,
        email: admin.email,
        role: "admin"
    },
    config.jwtSecret,
    {
        expiresIn: "2h"
    }
);

return {
    token,

    admin: {
        id: admin.id,
        email: admin.email,
        role: "admin"
    }
};

}