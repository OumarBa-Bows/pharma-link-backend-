const express = require("express");
const controller = require("./controller");
const middleware = require("./middleware");
const routes = express.Router({
  mergeParams: true,
});

routes.post("/login", [middleware.loginInputs()], controller.login);

routes.post(
  "/resfresh-token",
  [middleware.refreshTokenInputs()],
  controller.refreshToken
);

module.exports = {
  routes,
};
