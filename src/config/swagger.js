const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "InkForge API",
            description: "Documentação da API do InkForge",
            version: "1.0.0",
            contact: {
                name: "Suporte InkForge",
                email: "inkforgesmd@gmail.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local",
            },
            {
                url: "https://inkforge-be.onrender.com",
                description: "Produção",
            },
        ],
    },
    apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
