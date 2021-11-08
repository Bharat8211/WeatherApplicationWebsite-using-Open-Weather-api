require('dotenv').config();
const http = require("http");
const fs = require("fs");
const express = require("express");
var requests = require("requests");
const bodyParser = require("body-parser") 
const path = require ("path")
const app = express();
const port = process.env.PORT || 3000;

const staticPath = path.join(__dirname ,"public","home.html")

const homeFile = fs.readFileSync(staticPath, "utf-8");

app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.urlencoded({extended : true}));

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);
  console.log(orgVal.weather[0].main);
  return temperature;
};


app.get("/" , (req,res)=>{
    
    res.sendFile(path.join(__dirname ,"public","home.html"));
})

app.post("/",(req,res)=>{
    console.log(req.body.cityName )
    const query = req.body.cityName;
    requests(
      `http://api.openweathermap.org/data/2.5/weather?q=${query}&APPID=${process.env.APPID}&units=metric`
    )
      .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);
        const arrData = [objdata];
        // console.log(arrData[0].main.temp);
        const realTimeData = arrData
         .map((val) => replaceVal(homeFile, val))
          .join("");
        res.write(realTimeData);
        console.log(realTimeData);
      })
      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        res.send();
      });
})


app.listen(port, () => {
  console.log(`Server is up and running on ${port}`)
})

 