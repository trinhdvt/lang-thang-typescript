import express from "express";
import sequelize from "./models";
import IController from "./interfaces/IController";
import exceptionHandler from "./middlewares/ExceptionHandler";

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
        this.app.use(express.urlencoded({extended: true}));

    }

    private initExceptionMiddlewares() {
        this.app.use(exceptionHandler);
    }

    private initRoutes(controllers: IController[]) {
        controllers.forEach(api => {
            console.log(api.path);
            this.app.use("/", api.router);
        });
    }

    public getServer(): express.Application {
        return this.app;
    }

    private static async initDatabase() {
        await sequelize.sync();
    }
}

export default App;
