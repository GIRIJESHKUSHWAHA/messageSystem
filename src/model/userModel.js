require('../connection /con');
const bcrypt = require("bcrypt");
const validator = require('validator');
const jwt = require("jsonwebtoken");
require('dotenv').config()
const mongoose = require("mongoose");



const userModel = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: [true, "this id is all ready present"],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("email is invalid.....");
            }
        }
    },
     password: {
        type: String,
        required: true
    },
    rePassword: {
        type: String,
    },
    Date: {
        type: Date,
        default: Date.now
    }
})

userModel.methods.jwtAuthToken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        return token;
    } catch (error) {
        res.status(400).send("Registration field.........", error)
    }
}

const userTable = mongoose.model('userTable', userModel);
module.exports = userTable;
