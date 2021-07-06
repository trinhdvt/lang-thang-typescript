import "reflect-metadata"

require('dotenv').config();
import App from "./app";
import {useContainer, useExpressServer} from "routing-controllers";
import AuthController from "./controller/AuthController";
import {Container} from "typedi";
import {GlobalErrorHandler} from "./middlewares/GlobalErrorHandler";

useContainer(Container);

const app = new App();
// create an express Application with common middleware
app.boostrap();

// inject controller
useExpressServer(app.getServer(), {
    development: true,
    defaultErrorHandler: false,
    defaults: {
        paramOptions: {
            required: true
        }
    },
    routePrefix: "/api",
    controllers: [AuthController],
    middlewares: [GlobalErrorHandler]
})

// connect to database then start server (default port is 8080)
app.listen();
