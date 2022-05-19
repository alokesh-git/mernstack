const mongoose = require('mongoose');

// creating the connection to the mongodb
mongoose.connect("mongodb://localhost:27017/loginData").then(()=> { console.log("connecting to the mongodb"); }).catch((e)=>{
    console.log(error);
})
