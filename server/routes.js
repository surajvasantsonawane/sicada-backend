import user from "./api/v1/controllers/user/routes";
import placeOrder from "./api/v1/controllers/placeOrder/routes";

/**
 *
 *
 * @export
 * @param {any} app
 */
export default function routes(app) {
  app.use("/api/v1/user", user)
  app.use("/api/v1/placeOrder", placeOrder)


  return app;
}
