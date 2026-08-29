import { app } from "./app.js";

import {
config
} from "./config.js";

import {
ensureAdmin
} from "./auth.js";

/*
Initialisation
--------------------------------------------------------------------------
*/

await ensureAdmin();

/*
Démarrage serveur
--------------------------------------------------------------------------
*/

const server =
app.listen(
config.port,
() => {

        console.log("");
        console.log(
            "================================="
        );
        console.log(
            "       NEXSHIELD API"
        );
        console.log(
            "================================="
        );
        console.log(
            `🚀 http://localhost:${config.port}`
        );
        console.log(
            `❤️  http://localhost:${config.port}/api/health`
        );
        console.log(
            "================================="
        );
        console.log("");
    }
);
/*
Arrêt propre
--------------------------------------------------------------------------
*/

function shutdown(signal) {

console.log(
    `\n${signal} reçu. Arrêt du serveur...`
);

server.close(() => {

    console.log(
        "Serveur arrêté proprement."
    );

    process.exit(0);
});

}

process.on(
"SIGINT",
() => shutdown("SIGINT")
);

process.on(
"SIGTERM",
() => shutdown("SIGTERM")
);