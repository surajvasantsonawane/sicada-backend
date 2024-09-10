import user from "./api/v1/controllers/user/routes";
import placeOrder from "./api/v1/controllers/placeOrder/routes";
import bankDetails from "./api/v1/controllers/bankDetails/routes";
import notification from "./api/v1/controllers/notification/routes";
import sumsub from "./api/v1/controllers/sumsub/routes";


/**
 *
 *
 * @export
 * @param {any} app
 */
export default function routes(app) {
  app.use("/api/v1/user", user)
  app.use("/api/v1/placeOrder", placeOrder)
  app.use("/api/v1/bankDetails", bankDetails)
  app.use("/api/v1/notification", notification)

  app.use("/api/v1/sumsub", sumsub)


  return app;
}
