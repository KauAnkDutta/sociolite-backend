const route = require('express').Router();
const userCtrl = require('../controller/userCtrl');

route.get(`/user/`, userCtrl.getUser);
route.post(`/userRegister`, userCtrl.registerUser);
route.post(`/userLogin`, userCtrl.loginUser);
route.put(`/user/:id/update`, userCtrl.updateUser);
route.get(`/get/friends/:userId`, userCtrl.getFriends);
route.put(`/user/:id/follow`, userCtrl.followUser);
route.put(`/user/:id/unfollow`, userCtrl.unfollowUser);
route.delete(`/user/delete/:id`, userCtrl.deleteUser);
route.get(`/getAllUsers/:id`, userCtrl.getAllUsers);

module.exports = route;