const express = require("express")

const app = express();

const userModel = require("./models/user");
const cookieParser = require("cookie-parser");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set("view engine", "ejs")
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));






// root route 

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/signup", (req, res) => {

    res.render("signup")

})

app.post("/signup", async function (req, res) {

    let { name, email, password } = req.body;

    let alreadyUser = await userModel.findOne({ email })

    if (alreadyUser) return res.status(400).send("User already in DB")

    if (!name || !email || !password) {
        return res.status(400).send({
            message: "all inputs are mandatory"
        });
    }


    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            let createdUser = await userModel.create({
                name,
                email,
                password: hash,
            })


            let token = jwt.sign({ email: email, userid: createdUser._id }, "newkey");
            res.cookie("token", token);

            res.send(`Signup Completed ${name} `)

        });
    });



})


app.get('/login', function (req, res) {
    res.render("login")
})

app.post("/login", async function (req, res) {

    let { email, password } = req.body;

    let alreadyUser = await userModel.findOne({ email })

    if (!alreadyUser) return res.status(400).send("User not Found")

    if (!email || !password) {
        return res.status(400).send({
            message: "all inputs are mandatory"
        });
    }


    bcrypt.compare(password, alreadyUser.password, function (err, result) {
        if (result) return res.status(200).send(`Successfully Logged In ${alreadyUser.name}  with ${alreadyUser.email} `)
        else {
            res.redirect("/login")
            res.send("Invalid Credentials")

        }

    })



})







app.listen(5000)