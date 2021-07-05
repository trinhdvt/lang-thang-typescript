import express from "express";
import sequelize from "./models";
import IController from "./interfaces/IController";
import exceptionHandler from "./middlewares/ExceptionHandler";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import multer from "multer";

require('dotenv').config();

class App {

    private readonly app: express.Application;

    constructor(controllers: IController[]) {
        this.app = express();

        this.initMiddlewares();
        this.initRoutes(controllers);
        this.initExceptionMiddlewares();
    }

    public listen() {
        const port: number = parseInt(process.env.PORT ?? '8080');

        App.initDatabase().then(() => {
            console.log('Database initialized!')

            this.app.listen(port, () => {
                console.log(`Server listening on port ${port}`);
            });

        }).catch(err => console.error(`Error when initial database${err}`));

    }

    private initMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(multer().none());
        this.app.use(cookieParser());

    }

    private initExceptionMiddlewares() {
        this.app.use(exceptionHandler);
    }

    private initRoutes(controllers: IController[]) {
        const routes: string[] = [];
        controllers.forEach(api => {
            routes.push(api.path);

            this.app.use(api.path, api.router);
        });

        console.log(`${routes.length} Routes added: [${routes.join(', ')}]`);
    }

    public getServer(): express.Application {
        return this.app;
    }

    private static async initDatabase() {
        await sequelize.sync();
    }
}

export default App;
