const bcrypt = require("bcrypt");
const express = require('express');
const jwt = require("jsonwebtoken");
require('dotenv').config()
const auth = require('./middleWare/auth')
require('./connection /con');
const userTable = require('./model/userModel');
const messageTable = require('./model/messageModel');
const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/message', async (req, res) => {
    const result = await messageTable.find();
    res.send(result);
})

app.post('/register', async (req, res) => {
    try {
        const password = req.body.password;
        const rePassword = req.body.rePassword;
        if (password === rePassword) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password, salt);

            const stTable = new userTable({
                name: req.body.name,
                email: req.body.email,
                password: hashPassword
            })

            const token = stTable.jwtAuthToken();
            await stTable.save().then((doc) => res.status(201).send(doc));

        } else {
            console.log("Password is mismatch...")
            res.send("password is mismatch......")
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }
})
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const user = await userTable.findOne({ email: email });
        if (!user) {
            res.send("Invalid email id");
        }
        console.log(req.body.password, "    ", user.password);
        const passMatch = await bcrypt.compare(req.body.password, user.password);
        if (passMatch) {
            //creating  token for user authentication  
            const token = await user.jwtAuthToken();
            await user.save().then((doc) => res.status(201).send({ user: { email: doc.email }, token: token }));
        }
        else {
            res.send("invalid login details .....")
        }

    }
    catch (error) {
        res.send({ msg: "Invalid user id..", err: error });
    }
});



app.get('/users', async (req, res) => {

    console.log(req.user);

    const allUsers = await userTable.find({}, '_id, email');
    res.send({ msg: "all user details:", allUsers })

})
app.post('/send/message', auth, async (req, res) => {
    try {
        console.log(req.user)
        const msg = new messageTable({
            sender: req.user._id,
            receiver: req.body.receiver,
            message: req.body.message
        })
        const message = await msg.save();
        res.send({ message });
    } catch (error) {
        res.send({ mse: "token is not verify:", error });
    }

})

app.get('/get/message', auth, async (req, res) => {
    try {

        //  req.user._id
        // req.body.user_id
       // console.log("user: ", req.user._id, "send: ", req.query._id)
        const message = await messageTable.find({
            // /$or : [{ receiver: req.user._id }]
            $or: [{ $and: [{ sender: req.user._id }, { receiver: req.query._id }] },
            { $and: [{ receiver: req.user._id }, { sender: req.query._id }] }]
        })
        //    $or: [
        //        {$and: [{sender:req.user._id},{receiver:req.body.user_id}],

        //    [{receiver:req.user._id },{sender:req.body.user_id}]}]
        // });

        res.send(message)
    } catch (error) {
        res.send({ mse: "some thing went wrong:", error });
    }

})


app.delete('/delete/message', auth, async (req, res) => {
    try {
       const msg = await messageTable.findOne({_id: req.body.msgId, sender: req.user._id });

        if (msg && msg._id) {
            const deleteMsg = await messageTable.deleteOne({ _id: req.body._id });
            res.status(201).send({
                msg: 'deleted',
                data: deleteMsg
            })
        }
        else {
            res.send("unable to delete")
        }
    } catch (error) {
        res.send({ mse: "some thing went wrong:", error });
    }

})

app.delete('/delete/messages', auth, async (req, res) => {
    try {

        const message = await messageTable.deleteMany({
      $or: [{ $and: [{ sender: req.user._id }, { receiver: req.body._id }] },
            { $and: [{ receiver: req.user._id }, { sender: req.body._id }] }]
        })
    

        res.send({all_deleted_data: "all message is deleted:",message})
    } catch (error) {
        res.send({ mse: "some thing went wrong:", error });
    }

})

app.listen(port, () => {
    console.log('Server is running on port 3000');
})




