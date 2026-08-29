import { Router } from "express";
import rateLimit from "express-rate-limit";

import { db } from "./db.js";

import {
contactSchema,
loginSchema,
statusSchema
} from "./validation.js";

import {
loginAdmin
} from "./auth.js";

import {
requireAuth
} from "./middleware.js";

const router = Router();

/*
Rate limit formulaire contact
--------------------------------------------------------------------------
*/

const contactLimiter = rateLimit({

windowMs: 15 * 60 * 1000,

limit: 10,

standardHeaders: "draft-8",

legacyHeaders: false,

message: {
    success: false,
    error:
        "Trop de demandes. Veuillez réessayer plus tard."
}

});

/*
Rate limit login
--------------------------------------------------------------------------
*/

const loginLimiter = rateLimit({

windowMs: 15 * 60 * 1000,

limit: 5,

standardHeaders: "draft-8",

legacyHeaders: false,

message: {
    success: false,
    error:
        "Trop de tentatives de connexion."
}

});

/*
HEALTH CHECK
--------------------------------------------------------------------------
*/

router.get(
"/health",
(req, res) => {

    res.json({
        success: true,

        status: "ok",

        service: "NEXSHIELD API",

        timestamp:
            new Date().toISOString()
    });
}

);

/*
POST /api/contact
--------------------------------------------------------------------------
*/

router.post(
"/contact",
contactLimiter,
(req, res) => {

    const parsed =
        contactSchema.safeParse(req.body);

    if (!parsed.success) {

        return res.status(400).json({

            success: false,

            error:
                "Données invalides.",

            details:
                parsed.error.flatten()
                    .fieldErrors
        });
    }

    const {
        name,
        email,
        service,
        message
    } = parsed.data;

    const result =
        db.prepare(
            `
            INSERT INTO contacts (
                name,
                email,
                service,
                message
            )
            VALUES (?, ?, ?, ?)
            `
        ).run(
            name,
            email.toLowerCase(),
            service,
            message
        );

    const contact =
        db.prepare(
            `
            SELECT
                id,
                name,
                email,
                service,
                status,
                created_at
            FROM contacts
            WHERE id = ?
            `
        ).get(
            result.lastInsertRowid
        );

    res.status(201).json({

        success: true,

        message:
            "Votre demande a bien été enregistrée.",

        data: contact
    });
}

);

/*
POST /api/auth/login
--------------------------------------------------------------------------
*/

router.post(
"/auth/login",
loginLimiter,
async (req, res, next) => {

    try {

        const parsed =
            loginSchema.safeParse(
                req.body
            );

        if (!parsed.success) {

            return res.status(400).json({
                success: false,
                error:
                    "Identifiants invalides."
            });
        }

        const {
            email,
            password
        } = parsed.data;

        const result =
            await loginAdmin(
                email.toLowerCase(),
                password
            );

        if (!result) {

            return res.status(401).json({
                success: false,
                error:
                    "Email ou mot de passe incorrect."
            });
        }

        res.json({
            success: true,
            ...result
        });

    } catch (error) {

        next(error);
    }
}

);

/*
GET /api/contacts
--------------------------------------------------------------------------
*/

router.get(
"/contacts",
requireAuth,
(req, res) => {

    const limit =
        Math.min(
            Math.max(
                Number(req.query.limit) || 50,
                1
            ),
            100
        );

    const offset =
        Math.max(
            Number(req.query.offset) || 0,
            0
        );

    const contacts =
        db.prepare(
            `
            SELECT
                id,
                name,
                email,
                service,
                message,
                status,
                created_at,
                updated_at
            FROM contacts
            ORDER BY id DESC
            LIMIT ?
            OFFSET ?
            `
        ).all(
            limit,
            offset
        );

    const total =
        db.prepare(
            `
            SELECT COUNT(*) AS count
            FROM contacts
            `
        ).get().count;

    res.json({

        success: true,

        data: contacts,

        pagination: {
            total,
            limit,
            offset
        }
    });
}

);

/*
GET /api/contacts/
--------------------------------------------------------------------------
*/

router.get(
"/contacts/",
requireAuth,
(req, res) => {

    const id =
        Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {

        return res.status(400).json({
            success: false,
            error: "ID invalide."
        });
    }

    const contact =
        db.prepare(
            `
            SELECT
                id,
                name,
                email,
                service,
                message,
                status,
                created_at,
                updated_at
            FROM contacts
            WHERE id = ?
            `
        ).get(id);

    if (!contact) {

        return res.status(404).json({
            success: false,
            error:
                "Contact introuvable."
        });
    }

    res.json({
        success: true,
        data: contact
    });
}

);

/*
PATCH /api/contacts//status
--------------------------------------------------------------------------
*/

router.patch(
"/contacts//status",
requireAuth,
(req, res) => {

    const id =
        Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {

        return res.status(400).json({
            success: false,
            error: "ID invalide."
        });
    }

    const parsed =
        statusSchema.safeParse(
            req.body
        );

    if (!parsed.success) {

        return res.status(400).json({
            success: false,
            error:
                "Statut invalide."
        });
    }

    const result =
        db.prepare(
            `
            UPDATE contacts

            SET
                status = ?,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = ?
            `
        ).run(
            parsed.data.status,
            id
        );

    if (!result.changes) {

        return res.status(404).json({
            success: false,
            error:
                "Contact introuvable."
        });
    }

    res.json({

        success: true,

        message:
            "Statut mis à jour."
    });
}

);

/*
DELETE /api/contacts/
--------------------------------------------------------------------------
*/

router.delete(
"/contacts/",
requireAuth,
(req, res) => {

    const id =
        Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {

        return res.status(400).json({
            success: false,
            error: "ID invalide."
        });
    }

    const result =
        db.prepare(
            `
            DELETE FROM contacts
            WHERE id = ?
            `
        ).run(id);

    if (!result.changes) {

        return res.status(404).json({
            success: false,
            error:
                "Contact introuvable."
        });
    }

    res.json({

        success: true,

        message:
            "Contact supprimé."
    });
}

);

export default router;