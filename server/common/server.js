import express from "express";
import Mongoose from "mongoose";
import * as http from "http";
import * as path from "path";
import cors from "cors";
import config from "config";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import apiErrorHandler from '../helper/apiErrorHandler';

const app = new express();
const server = http.createServer(app);
const root = path.normalize(`${__dirname}/../..`);
// require("../tickers/websocketIndex");
import WebSocket from "websocket";
const WebSocketServer = WebSocket.server;
const WebSocketClient = WebSocket.client;
const client = new WebSocketClient();
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 64 * 1024 * 1024, // 64MiB
  maxReceivedMessageSize: 64 * 1024 * 1024, // 64MiB
  fragmentOutgoingMessages: false,
  keepalive: false,
  disableNagleAlgorithm: false,
});
class ExpressServer {
  constructor() {
    app.use(express.json({ limit: '1000mb' }));

    app.use(express.urlencoded({ extended: true, limit: '1000mb' }))

    app.use(morgan('dev'))

    // Serve static files from the 'uploads' directory
   // app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use('/uploads', express.static('uploads'));

    app.use(
      cors({
        allowedHeaders: ["Content-Type", "token", "authorization"],
        exposedHeaders: ["token", "authorization"],
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
      })
    );
  }
  router(routes) {
    routes(app);
    return this;
  }

  configureSwagger(swaggerDefinition) {
    const options = {
      swaggerDefinition,
      apis: [
        path.resolve(`${root}/server/api/v1/controllers/**/*.js`),
        path.resolve(`${root}/api.yaml`),
      ],
    };

    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
    return this;
  }

  handleError() {
    app.use(apiErrorHandler);
    return this;
  }

  configureDb(dbUrl) {
    return new Promise((resolve, reject) => {
      Mongoose.connect(
        dbUrl,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
        (err) => {
          if (err) {
            console.log(`Error in mongodb fileUploadCont
              
              
              
              connection ${err.message}`);
            return reject(err);
          }
          console.log("Mongodb connection established");
          return resolve(this);
        }
      );
    });
  }

  listen(port) {
    server.listen(port, () => {
      console.log(`secure app is listening 🌍 @port ${port}`, new Date().toLocaleString());
    });
    return app;
  }
}

wsServer.on('request', function (request) {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  
  const connection = request.accept('', request.origin);

  async function getNotificationList(token) {
    if (connection.connected) {
      let result = await notificationController.getNotificationList(token);
      if (result) {
        let data = JSON.stringify(result);
        connection.sendUTF(data);
      }
      setTimeout(() => {
        getNotificationList(token)
      }, 5000);
    }
  }
  //******************************************************************************************/
  connection.on('message', async function (message) {
    try {
      let request = JSON.parse(message.utf8Data);
      var type = JSON.parse(message.utf8Data);
      if (type.type === "getTickers") {
        connection.sendUTF(getTickers(type));
      }
    } catch (error) { console.log('websocket message event error: ', error) }
  })
  async function fetchPredictionPool() {
    setInterval(async () => {
      if (connection.connected) {
        let result = await fetchPoolList();
        if (result) {
          var data = JSON.stringify(result);
          connection.sendUTF(data);
        }
      }
    }, 2000);
  }
  async function getTickers(requestData) {
    setInterval(async () => {
      if (connection.connected) {
        try {
          let result = await tickerExchange.getTickerWebSocket(requestData);
          if (result) {
            var data = JSON.stringify(result);
            connection.sendUTF(data);
          }
        } catch (error) {
          console.error(
            "An error occurred while retrieving ticker data:",
            error
          );
        }
      }
    }, 2000);
  }

 
  connection.on('close', function (reasonCode, description) {
    console.log(new Date() + ' Peer ' + connection.remoteAddress + ' Client has disconnected.');
  });
  connection.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
  });

});

client.on('connect', function (connection) {
  connection.on('message', function (error) {
    console.log(new Date() + ' WebSocket Client Connected');
  });
  connection.on('error', function (error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function () {
    console.log('echo-protocol Connection Closed');
  });

});

client.connect(config.get('websocketAddress'), '');

client.connect('ws://nodepune-cexjoseph.mobiloitte.io:3047/');


export default ExpressServer;

function originIsAllowed(origin) {
  return true;
}



