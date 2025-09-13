// const { routes: authRoute } = require("../auth/route");

import { articleRoute } from "../article/route";

// const { routes: articleRoute } = require("../article/route");
const { accessToken } = require("../utils/verifyTokens");


module.exports = _setUpRoutes;

function _setUpRoutes(options = {}) {
  try {
    const app = options?.app;

    //---------------------------------------------------------------------------------------------
    // Import routes.
    app.use("/api/auth", authRoute);
    app.use("/api/articles", accessToken, articleRoute);

    // Everything's ok, continue.
    return (req, res, next) => next();
  } catch (error) {
    console.log("Error in middleware initialization: ", error);
    const err = new Error(`Could not setup routes: ${error.message}`);
    err.name = error?.name;
    err.code = error?.code;
    throw error;
  }
}
