const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const redis = require("redis");
require("dotenv").config();

app.use(express.text());
const client = redis.createClient({
  url: "rediss://default:AfSuAAIjcDFiY2E2M2RiZGYwNDE0NTJjODY0YjZiYjU0NjcyYzkxM3AxMA@mighty-gnat-62638.upstash.io:6379",
});
client.on("error", (err) => console.log(err, "ERROR in REDIS"));
client.connect();

const authenticate = async (req, res, next) => {
  const token = req.headers?.authorization;
  console.log("From Middleware:", token);
  if (!token) {
    return res.send({ msg: "Enter Token First" });
  } else {
    try {
      const blacklistdata = await client.LRANGE("token", 0, -1);
      console.log(blacklistdata);
      if (blacklistdata.includes(token)) {
        return res.send({ msg: "Token Blackilsted/Logout" });
      }
      const decoded = jwt.verify(token, process.env.key);
      if (decoded) {
        const userID = decoded.userID;
        const email = decoded.email;
        console.log("Middleware Console", userID, email);
        req.body.userID = userID;
        req.body.email = email;

        next();
      } else {
        res.send({ msg: "Wrong Token" });
      }
    } catch (e) {
      res.send({ msg: "Token Expired" });
    }
  }
};

module.exports = {
  authenticate,
};
