const route = require('express').Router();
const messageCtrl = require('../controller/messages');

route.post(`/message`, messageCtrl.addMessage);
route.get(`/message/:conversationId`, messageCtrl.getMessage);

module.exports = route;