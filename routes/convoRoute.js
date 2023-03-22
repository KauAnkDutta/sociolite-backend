const route = require('express').Router()
const conversationCtrl = require('../controller/conversationCtrl')

route.post(`/conversation`, conversationCtrl.createConvo)
route.get(`/conversation/:userId`, conversationCtrl.getConvo)
route.get(`/find/:firstUserId/:secondUserId`, conversationCtrl.getBothConvo);

module.exports = route;