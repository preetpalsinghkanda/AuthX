const express = require("express")

const app = express();

const userModel = require("./models/user");
const cookieParser = require("cookie-parser");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require("./models/user");

app.set("view engine", "ejs")
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



function IsAdminLogin(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return res.send("Please Login buddy :) ----  /login")
    }

    const admin = jwt.verify(token, "newkey");

    if (admin.isAdmin) {
        next();
    } else {
        return res.send("your account does not have 'ADMIN' access!")
    }

}









async function createAdmin() {

    const alreadyAdmin = await userModel.findOne(
        {
            email: "admin@gmail.com"
        }
    )

    if (alreadyAdmin) {
        return
    }


    const adminHash = await bcrypt.hash("admin@1234", 10)

    await userModel.create({
        name: "admin",
        email: "admin@gmail.com",
        password: adminHash,
        isAdmin: true,
    })

}


createAdmin()


// root route 

app.get("/", (req, res) => {
    res.render("index")
})


// signup
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
                isAdmin: false,
            })


            let token = jwt.sign({ email: email, userid: createdUser._id, isAdmin: createdUser.isAdmin }, "newkey");
            res.cookie("token", token);

            res.send(`Signup Completed ${name} `)

        });
    });



})


//login

app.get('/login', function (req, res) {
    res.render("login")
})

app.post("/login", async function (req, res) {


    try {
        let { email, password } = req.body;



        if (!email || !password) {
            return res.status(400).send({
                message: "all inputs are mandatory"
            });
        }

        let alreadyUser = await userModel.findOne({ email })

        if (!alreadyUser) return res.status(400).send("User not Found --- /signup")




        bcrypt.compare(password, alreadyUser.password, function (err, result) {
            if (result) {
                let token = jwt.sign({
                    email: alreadyUser.email,
                    userid: alreadyUser._id,
                    isAdmin: alreadyUser.isAdmin,

                }, "newkey");
                res.cookie("token", token)



                res.status(200).send(
                    `Successfully Logged In as ${alreadyUser.name}`
                );

            }

            else {

                res.send("Invalid Credentials")

            }

        })


    } catch (err) {

        res.status(500).send("something went wrong");

    }





})


//admin or allusers

app.get("/users", IsAdminLogin, async (req, res) => {


    const allusers = await user.find()

    res.render("users", { allusers })

})




app.post("/delete/:id", async (req, res) => {

    let userId = req.params.id
    await userModel.deleteOne({ _id: userId })
    res.redirect("/users")

})






app.listen(5000)