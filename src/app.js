require("dotenv").config();
const express = require('express');
const hbs = require('hbs');
const requests = require('requests');
const connectdb = require('./db/connect');
const Collections = require("./models/collections")
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();
const { Navigator } = require("node-navigator");
const navigator = new Navigator();

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../template/view"));

hbs.registerPartials(path.join(__dirname, "../template/partical"));

let api;
let city;


app.get("/", (req, res) => {
    navigator.geolocation.getCurrentPosition((success, error) => {
        console.log(error);
        requests(`https://api.openweathermap.org/geo/1.0/reverse?lat=${success.latitude}&lon=${success.longitude}&units=metric&appid=90d8a7f5a187724bdedcd073217c1538`)
            .on("data", (chank) => {
                const data = JSON.parse(chank);
                requests(`https://api.openweathermap.org/data/2.5/weather?q=${data[0].name}&units=metric&appid=90d8a7f5a187724bdedcd073217c1538`)
                    .on("data", (chank) => {
                        const value = JSON.parse(chank);
                         api = JSON.stringify(value);
                        requests(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${success.latitude}&lon=${success.longitude}&units=metric&appid=90d8a7f5a187724bdedcd073217c1538`)
                            .on("data", (chank) => {
                                const pollution = JSON.parse(chank);
                                const datavalue = pollution.list[0].components;
                                city = data[0].name;
                                res.render("index", {
                                    class_1: "on",
                                    city: data[0].name,
                                    country: data[0].country,
                                    state: data[0].state,
                                    weather: value.weather[0].main,
                                    temp: value.main.temp,
                                    temp_min: value.main.temp_min,
                                    temp_max: value.main.temp_max,
                                    pressure: value.main.pressure,
                                    humidity: value.main.humidity,
                                    visibility: value.visibility,
                                    wind: value.wind.speed,
                                    sunrise: new Date(value.sys.sunrise).toLocaleTimeString(),
                                    sunset: new Date(value.sys.sunset).toLocaleTimeString(),
                                    lon: value.coord.lon,
                                    lat: value.coord.lat,
                                    co: datavalue.co,
                                    no: datavalue.no,
                                    no2: datavalue.no2,
                                    o3: datavalue.o3,
                                    so2: datavalue.so2,
                                    pm2_5: datavalue.pm2_5,
                                    pm10: datavalue.pm10,
                                    nh3: datavalue.nh3,
                                    img_1: chank,
                                })


                            })

                    })

            })
    })


})
app.get("/weather", (req, res) => {
    res.render("weather", {
        class_2: "on",
        Api:api,
        city:city,
    })
})
app.get("/about", (req, res) => {
    res.render("about", {
        class_3: "on",
    })
})
app.get("/login",(req,res)=>{
    res.render("login",{
        class_4:"on",
    })
})
app.get("/register",(req,res)=>{
    res.render("register",{
        class_5:"on",
    })
})
app.post("/register",async (req,res)=>{
    try {
        const document = new Collections({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            gender:req.body.gender,
            phone:req.body.phone,
            age:req.body.age,
            password:req.body.password,
            Confirm_password:req.body.Confirm_password,
            image:req.body.image,
        })
       

        if(req.body.password === req.body.Confirm_password){
            const token = await document.applingwebtoken()
         await document.save();
            res.render("index",{
                class_1:"on",
         })
       
    }else{
        res.send("error password")
    }
        
    } catch (error) {
        res.status(500).send(error)
    }
})
app.post("/login", async (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const data = await Collections.findOne({email});
    const ismatch = await bcrypt.compare(password,data.password);
    const token = await data.applingwebtoken();
     console.log(token);
    if(ismatch){
        res.status(201).render("index");
    }
    else{
        res.status(403).send("invalid login")
    }
})
app.get("*", (req, res) => {
    res.render("404")
})
app.get("/weather*", (req, res) => {
    res.render("404")
})
app.get("/about*", (req, res) => {
    res.render("404")
})
app.get("/login*", (req, res) => {
    res.render("404")
})
app.get("/register*", (req, res) => {
    res.render("404")
})

app.listen(port, () => {
    console.log("listening port no 8000")
})  