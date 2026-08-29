import {
describe,
it,
expect
} from "vitest";

import request from "supertest";

import {
app
} from "../src/app.js";

/*
Tests API NEXSHIELD
--------------------------------------------------------------------------
*/

describe(
"NEXSHIELD API",
() => {

    /*
    |--------------------------------------------------------------------------
    | Health
    |--------------------------------------------------------------------------
    */

    it(
        "GET /api/health retourne 200",
        async () => {

            const response =
                await request(app)
                    .get("/api/health");

            expect(
                response.status
            ).toBe(200);

            expect(
                response.body.success
            ).toBe(true);

            expect(
                response.body.status
            ).toBe("ok");
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Validation contact
    |--------------------------------------------------------------------------
    */

    it(
        "POST /api/contact rejette les données invalides",
        async () => {

            const response =
                await request(app)
                    .post("/api/contact")
                    .send({

                        name: "A",

                        email: "email-invalide",

                        service: "UNKNOWN",

                        message: "x"
                    });

            expect(
                response.status
            ).toBe(400);

            expect(
                response.body.success
            ).toBe(false);
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Authentification
    |--------------------------------------------------------------------------
    */

    it(
        "GET /api/contacts nécessite une authentification",
        async () => {

            const response =
                await request(app)
                    .get("/api/contacts");

            expect(
                response.status
            ).toBe(401);

            expect(
                response.body.success
            ).toBe(false);
        }
    );

    /*
    |--------------------------------------------------------------------------
    | Route inconnue
    |--------------------------------------------------------------------------
    */

    it(
        "Une route inexistante retourne 404",
        async () => {

            const response =
                await request(app)
                    .get("/api/does-not-exist");

            expect(
                response.status
            ).toBe(404);

            expect(
                response.body.success
            ).toBe(false);
        }
    );
}

);