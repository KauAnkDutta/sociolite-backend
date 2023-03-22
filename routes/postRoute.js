const route = require('express').Router()
const postCtrl = require('../controller/postCtrl')

route.post(`/Create/post`, postCtrl.createPost);
route.put(`/updatepost/:id`, postCtrl.updatePost);
route.delete(`/deletepost/:id`, postCtrl.deletePost);
route.put(`/userpost/:id/likedislike`, postCtrl.like_dislike_post);
route.get(`/getPost/:id`, postCtrl.getPost);
route.get(`/timeline/:userId`, postCtrl.getTimelinePost);
route.get(`/profile/:username`, postCtrl.getUsersAllPost);
route.put(`/post/comment/:id`, postCtrl.sentComment)
route.get(`/post/comments/:id`, postCtrl.getComments)

module.exports = route;