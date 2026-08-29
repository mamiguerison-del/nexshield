import "dotenv/config";

const corsOrigins = (process.env.CORS_ORIGIN || "")
.split(",")
.map((origin) => origin.trim())
.filter(Boolean);

export const config = {
port: Number(process.env.PORT || 3000),

nodeEnv: process.env.NODE_ENV || "development",

databaseFile:
    process.env.DATABASE_FILE || "./data/nexshield.db",

jwtSecret:
    process.env.JWT_SECRET || "",

corsOrigins,

adminEmail:
    process.env.ADMIN_EMAIL || "",

adminPassword:
    process.env.ADMIN_PASSWORD || ""

};

if (!config.jwtSecret) {
console.warn(
"⚠️ JWT_SECRET n'est pas défini dans le fichier .env"
);
}

if (config.jwtSecret.length < 32) {
console.warn(
"⚠️ JWT_SECRET devrait contenir au moins 32 caractères."
);
}