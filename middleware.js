import jwt from "jsonwebtoken";

import { config } from "./config.js";

/*
Route inexistante
--------------------------------------------------------------------------
*/

export function notFound(req, res) {

res.status(404).json({
    success: false,
    error: "Route introuvable."
});

}

/*
Gestion globale des erreurs
--------------------------------------------------------------------------
*/

export function errorHandler(err, req, res, next) {

console.error("SERVER ERROR:", err);

if (res.headersSent) {
    return next(err);
}

const status =
    Number(err.status) || 500;

res.status(status).json({
    success: false,

    error:
        status === 500
            ? "Erreur interne du serveur."
            : err.message
});

}

/*
Authentification JWT
--------------------------------------------------------------------------
*/

export function requireAuth(req, res, next) {

const authorization =
    req.headers.authorization || "";

const [scheme, token] =
    authorization.split(" ");

if (
    scheme !== "Bearer" ||
    !token
) {

    return res.status(401).json({
        success: false,
        error: "Authentification requise."
    });
}

try {

    const decoded = jwt.verify(
        token,
        config.jwtSecret
    );

    if (
        decoded.role !== "admin"
    ) {

        return res.status(403).json({
            success: false,
            error: "Accès interdit."
        });
    }

    req.admin = decoded;

    next();

} catch {

    return res.status(401).json({
        success: false,
        error: "Token invalide ou expiré."
    });
}

}