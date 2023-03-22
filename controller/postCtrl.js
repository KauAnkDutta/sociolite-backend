const Post = require('../model/postModel')
const User = require('../model/userModel')

const postCtrl = {
    // create a post
    createPost: async(req, res) => {
        const newPost = new Post(req.body)
        try {
            const savePost = await newPost.save()
            res.status(200).json({"post": savePost})
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // update a post 
    updatePost: async(req, res) => {
        try {
            const post = await Post.findById(req.params.id)
            if(post.userId === req.body.userId){
                await post.updateOne({$set: req.body})
                res.status(200).json({msg: "Update Successful"})
            }else{
                return res.status(403).json({error: "you can update only your post"})
            }
            
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // delete a post
    deletePost: async(req, res) => {
        try {
            const post = await Post.findById(req.params.id)
            if(post.userId === req.body.userId){
                await post.deleteOne();
                res.status(200).json({msg: "The post has been deleted"})
            }else{
                return res.status(403).json({msg: "You can delete only your post"})
            }
            
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // like or dislike a post
    like_dislike_post : async(req, res) => {
        try {
            const post = await Post.findById(req.params.id)
            if(!post.like.includes(req.body.userId)){
                await post.updateOne({ $push: {like: req.body.userId}})
                res.status(200).json({msg: "liked"})
            }else{
                await post.updateOne({$pull: {like: req.body.userId}})
                res.status(200).json({msg: "disliked"})
            }
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // get a post 
    getPost: async(req, res) => {
        try {
            const post = await Post.findById(req.params.id)
            res.status(200).json(post)
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // get all timeline posts
    getTimelinePost: async(req, res) => {
        try {
            const currentUser = await User.findById(req.params.userId)
            const userPost = await Post.find({userId: currentUser._id})
            const friendsPost = await Promise.all(
                currentUser.following.map((frindId) => {
                    return Post.find({userId : frindId})
                })
            )
            const friendsPost2 = await Promise.all(
                currentUser.followers.map((frindId) => {
                    return Post.find({userId : frindId})
                })
            )
            res.status(200).json(userPost.concat(...friendsPost,...friendsPost2))
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // get user's all post
    getUsersAllPost: async(req, res) => {
        try {
            const user = await User.findOne({username: req.params.username})
            const posts = await Post.find({userId: user._id})

            res.status(200).json(posts)
        } catch (error) {
            res.status(500).json(error)
        }
    },

    sentComment: async(req, res) => {
        let comment = req.body.comment;
        let postId = req.params.id

        try {
            const post = await Post.findById(postId)
            if(post){
                await post.updateOne({$push: {comments: comment}})

                res.status(200).json({msg: "Comment Added"})
            }
            
        } catch (error) {
            res.status(500).json({msg: "Server is not responding"})
        }
    },

    getComments: async(req, res) => {
        const postID = req.params.id
        try {
            const post = await Post.findById(postID)
            res.status(200).json(post.comments)

        } catch (error) {
            res.status(500).json({msg: "Server is not responding"})
        }
    }

}

module.exports = postCtrl;