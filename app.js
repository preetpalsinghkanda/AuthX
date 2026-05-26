const express = require("express")
require("dotenv").config();
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

    const admin = jwt.verify(token, process.env.JWT_SECRET);

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


            let token = jwt.sign({ name: createdUser.name, email: email, userid: createdUser._id, isAdmin: createdUser.isAdmin }, process.env.JWT_SECRET);
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
                    name: alreadyUser.name,
                    email: alreadyUser.email,
                    userid: alreadyUser._id,
                    isAdmin: alreadyUser.isAdmin,

                }, process.env.JWT_SECRET);
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


app.get("/edit/:id", async (req, res) => {

    let updateId = req.params.id

    let updateUser = await userModel.findOne({
        _id: updateId
    });

    res.render("edit", { updateUser })

})


app.post("/edit/:id", async (req, res) => {


    let updateId = req.params.id

    await userModel.findOneAndUpdate({ _id: updateId }, { name: req.body.name, email: req.body.email })

    res.redirect('/users')


})

function isUserLoggedIn(req, res, next) {

    const token = req.cookies.token

    if (!token) {
        return res.send("Signup or Login first !")

    }

    try {

        const loggedInUser = jwt.verify(token, process.env.JWT_SECRET)
        req.user = loggedInUser

        next();

    } catch (err) {

        res.send("session expired or invalid");

    }


}



app.get("/aboutme", isUserLoggedIn, (req, res) => {
    res.render('about', { user: req.user })

})



app.post("/logout", async (req, res) => {
    await res.clearCookie("token");
    res.redirect("/login");
})






app.listen(5000)