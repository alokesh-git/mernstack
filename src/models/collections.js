const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginshema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        upperCase: true,
        minlength: 2,
        maxlength: 10
    },
    lastname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 10
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"],
    },
    email: {
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address");
            }
        }
    },
    phone: {
        type: String,
        required: true,
        maxlength: 10,
    },
    age: {
        type: String,
        required: true,
        maxlength: 2,
        validate(value) {
            if (value < 15) {
                throw new Error("Uneligible age");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    },
    Confirm_password: {
        type: String,
        required: true,
        minlength: 5,
    },
    image: {
        type: Buffer,
    },

    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]


});

loginshema.methods.applingwebtoken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        return token;

    } catch (err) {
        res.send(err);
        console.log("token err" + err);

    }
}

loginshema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        // this.Confirm_password = await bcrypt.hash(this.password, 10);
        this.Confirm_password = undefined;

    }
    next();
})

const Collections = mongoose.model("Appliedform", loginshema);
module.exports = Collections;
