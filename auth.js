const jwt = require("jsonwebtoken");
const userTable = require('../model/userModel');

const auth = async (req, res, next) => {
    try {
        const payload = await jwt.verify(req.headers['token'], process.env.SECRET_KEY);
        if (payload._id) {
            const user = await userTable.findOne({ _id: payload._id });
            if (!user._id) {
                res.send({ msg: 'in invalid details' })
            }
            req.user = user;
            next();
        } else {
            res.send({
                msg: 'in invalid token'
            })
        }

    } catch (err) {
        res.send(`session has expire:.......${err}`);
    }
}

module.exports = auth;