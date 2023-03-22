const express = require('express')
const mongoose = require('mongoose')
const cors = require("cors")
const cookieParser = require('cookie-parser')
const dotenv = require("dotenv").config()
const helmet = require('helmet')
const morgan = require("morgan")
const {createProxyMiddleware} = require('http-proxy-middleware')
const path = require('path')

const app = express()

app.use("/images", express.static(path.join(__dirname, "/public/images")))

// middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(cors())
app.use(cookieParser())

app.use(helmet());
app.use(morgan("common"));

// connection to database
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true}, (err) => {
    if(err) throw err;
    console.log("MongoDb Connected")
})



app.use(`/api`, require('./routes/userRoute'));
app.use(`/api`, require('./routes/postRoute'));
app.use(`/api`, require('./routes/fileRoute'));
app.use(`/api`, require('./routes/convoRoute'));
app.use(`/api`, require('./routes/messageRoute'));
app.use(`/api`, createProxyMiddleware({target: `http://localhost:${process.env.PORT}`, changeOrigin: true}));


const server = app.listen(process.env.PORT || 5000, () => {
    console.log(`Sever is up and running at http://localhost:${process.env.PORT}`)
})

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user)=> user?.userId === userId) &&
        users.push({ userId, socketId })
};

const removeUser = (socketId) => {
    users = users.filter((user)=> user?.socketId !== socketId) 
}

const getUser = (userId) => {
    return users.find((user) => user?.userId === userId)
} 

io.on("connection", (socket) => {
    // when connect 
    console.log("A User Is Connected")

    // take useId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id)
        io.emit("getUsers", users)
    })

    // realtime typing functionality
    socket.on("typing", (receiverId) => {
        const r_user = getUser(receiverId)
        console.log(r_user?.socketId)
        io.to(r_user?.socketId).emit("typing")
    })

    socket.on("stop typing", (receiverId) => {
        const rr_user = getUser(receiverId)
        io.to(rr_user?.socketId).emit("stop typing")
    })

    // send and get message
    socket.on("sendMessage",({senderId, receiverId, text, convoId, quan}) => {
        const user = getUser(receiverId)
        io.to(user?.socketId).emit("getMessage", {
            senderId,
            text,
            convoId,
            quan,
        })
    })
    
    // when disconnect
    socket.on('disconnect', () => {
        console.log("A user Disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users)
    })
})