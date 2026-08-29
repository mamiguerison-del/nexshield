import express from "express";
import cors from "cors";
import helmet from "helmet";

import { config } from "./config.js";

import router from "./routes.js";

import {
notFound,
errorHandler
} from "./middleware.js";

export const app = express();

/*
Sécurité Express
--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

app.set(
"trust proxy",
1
);

/*
Helmet
--------------------------------------------------------------------------
*/

app.use(
helmet()
);

/*
CORS
--------------------------------------------------------------------------
*/

app.use(
cors({

    origin(origin, callback) {

        /*
         * Autorise les requêtes sans Origin
         * comme certains outils de test.
         */

        if (!origin) {
            return callback(null, true);
        }

        if (
            config.corsOrigins
                .includes(origin)
        ) {

            return callback(
                null,
                true
            );
        }

        return callback(
            new Error(
                "Origine CORS non autorisée."
            )
        );
    },

    methods: [
        "GET",
        "POST",
        "PATCH",
        "DELETE"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]
})

);

/*
JSON
--------------------------------------------------------------------------
*/

app.use(
express.json({
limit: "20kb"
})
);

/*
URL encoded
--------------------------------------------------------------------------
*/

app.use(
express.urlencoded({
extended: false,
limit: "20kb"
})
);

/*
API
--------------------------------------------------------------------------
*/

app.use(
"/api",
router
);

/*
404
--------------------------------------------------------------------------
*/

app.use(
notFound
);

/*
Error handler
--------------------------------------------------------------------------
*/

app.use(
errorHandler
);