const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
