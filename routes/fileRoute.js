const route = require('express').Router()
const fileCtrl = require('../controller/fileCtrl')
const upload = require('../middleware/config')

route.post(`/upload`,upload, fileCtrl.upload)

module.exports = route;