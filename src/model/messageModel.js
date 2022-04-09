require('../connection /con');
const bcrypt = require("bcrypt");
const validator = require('validator');
const jwt = require("jsonwebtoken");
require('dotenv').config()
const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({

    sender: {
        type: String,
        require: true,
    },
    receiver: {
        type: String,
        require: true,
    },
    message: {
        type: String,
    },
    Date: {
        type: Date,
        default: Date.now
    }
}) 
const messageTable = mongoose.model('messageTable',messageSchema);
module.exports = messageTable;