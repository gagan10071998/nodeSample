const express = require("express");
const morgan = require("morgan");
const mongoose = require('mongoose');
const redis = require('redis');
const app = express();  //Create new instance
const bluebird = require('bluebird')
const PORT = process.env.PORT || 5000; //Declare the port number
app.use(express.json());    //allows us to access request body as req.body
app.use(morgan("dev"));     //enable incoming request logging in dev mode

const models = require('./models')
mongoose.connect("mongodb://localhost:27017/test1", { useNewUrlParser: true, useUnifiedTopology: true }).then(
    (db) => console.log(`****************************************** MONGODB CONNECTED ***********************************************`),
    (err) => console.log("MongoDB " + String(err.message))
);

models.list.collection.drop()


/*
Redis Connection
*/

bluebird.promisifyAll(redis)
global.REDIS_CLIENT = redis.createClient();
REDIS_CLIENT.on('connect', function () { console.log(`****************************************** REDIS CONNECTED *******************************************************`); });
REDIS_CLIENT.del('List')
global.dummyArray = Array.from({ length: 999999 }, () => String(Math.floor(Math.random() * 40)));


app.get("/ping", async (req, res) => {   //Define the endpoint
    return res.send({
        status: "Healthy"
    });

});

app.post("/ping1", async (req, res) => {   //Define the endpoint
    await REDIS_CLIENT.set("List", JSON.stringify(dummyArray), function (err) {
        if (err) throw err;
    })
    return res.send({
        status: JSON.parse(await REDIS_CLIENT.getAsync("List"))
    });

});

app.post("/ping2", async (req, res) => {   //Define the endpoint
    await models.list({ List: JSON.stringify(dummyArray) }).save()
    return res.send({
        status: JSON.parse((await models.list.findOne().lean()).List)
    });

});

app.listen(PORT, () => {
    console.log("Server started listening on port : ", PORT);
});