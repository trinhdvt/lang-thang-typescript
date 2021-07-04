import 'reflect-metadata';
import App from "./app";
import {controllers} from "./controller";

const app = new App(controllers);
app.listen();
