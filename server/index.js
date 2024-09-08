import Config from "config";
import Routes from "./routes";
import Server from "./common/server";
// const dbUrl = `mongodb://${Config.get("databaseHost")}:${Config.get(
//   "databasePort"
// )}/${Config.get("databaseName")}`;
//const dbUrl = `mongodb://mulsan:mulsan@192.168.0.130:27017/?directConnection=true`
//const dbUrl = `mongosh "mongodb://mulsan:mulsan@192.168.0.146:27017/?directConnection=true"`
const dbUrl = `mongodb+srv://doadmin:8X91J7g34v0D5fMm@db-mongodb-nyc3-97578-d047bd22.mongo.ondigitalocean.com/sicada?tls=true&authSource=admin&replicaSet=db-mongodb-nyc3-97578`


const server = new Server()
  .router(Routes)
  .configureSwagger(Config.get("swaggerDefinition"))
  .handleError()
  .configureDb(dbUrl)
  .then((_server) => _server.listen(Config.get("port")));

export default server;