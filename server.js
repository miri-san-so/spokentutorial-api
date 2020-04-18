const express = require("express");
const expressGraphQL = require("express-graphql");
const schema = require("./schema");
const app = express();
const cors = require("cors");

app.use("/", cors());

app.use(
  "/graphql",
  expressGraphQL({
    schema,
    graphiql: true,
  })
);

app.listen(4000, () =>
  console.log("Server initiated at PORT: 4000\nhttp://localhost:4000/")
);
