const express = require("express")

const app = express();

const userModel = require("./models/user");
const cookieParser = require("cookie-parser");



app.set("view engine" , "ejs")
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({extended:true}));






// root route 

app.get("/" , (req, res)=>{

    res.render("index")

})

// post - create 


app.post("/create" , function(req, res){



})





app.listen(5000)