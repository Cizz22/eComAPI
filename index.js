const express = require("express");
const { connect } = require("mongoose");
const dotenv = require("dotenv");
const app = express();
dotenv.config();
app.use(express.json());


//Router
const userRoute = require("./Router/users");
const authRoute = require("./Router/auth");
const productRoute = require("./Router/products")
const cartRoute = require("./Router/carts")

//Db connect
connect(`${process.env.MONGO_DB}`)
  .then(() => console.log("DB Connected!!"))
  .catch((error) => console.log(error));

app.listen(process.env.PORT || 5000, () => {
  console.log("tess");
});

//API endpoint
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute)

