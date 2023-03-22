const User = require("../model/userModel");
const bcrypt = require("bcrypt");

const userCtrl = {
  registerUser: async (req, res) => {
    try {
      const { username, email, password, city, from } = req.body;
      const passHash = await bcrypt.hash(password, 10);

      // create user
      const newUser = new User({
        username: username,
        email: email,
        password: passHash,
        city: city,
        from: from,
      });

      // save user and response
      const user = await newUser.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({msg: "Request Cannot be Compeleted"});
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: "User Not Found" });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(400).json({msg: "Wrong Password"});
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({msg: "Request Failed"});
    }
  },

  // update User
  updateUser: async (req, res) => {
    let id = req.params.id;
    if (req.body.userId === id || req.params.isAdmin) {
      if (req.body.password) {
        try {
          req.body.password = await bcrypt.hash(req.body.password, 10);
        } catch (error) {
          res.status(500).json(error);
        }
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(id, {
          $set: req.body,
        });
        res.status(200).json({ msg: "Account has beed updated successfully" });
      } catch (error) {
        res.status(500).json({msg: "Failed To Update Account"});
      }
    } else {
      return res.status(403).json({ msg: "You can update only your account" });
    }
  },

  // delete user
  deleteUser: async (req, res) => {
    let id = req.params.id;
    if (req.body.userId === id || req.body.isAdmin) {
      try {
        await User.findByIdAndDelete(id);
        res.status(200).json({ msg: "Account has been deleted successfully" });
      } catch (error) {
        return res.status(500).json(error);
      }
    } else {
      return res.status(403).json({ msg: "You can only delete your account" });
    }
  },

  // get a particular user
  getUser: async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;

    try {
      const user = userId
        ? await User.findById(userId)
        : await User.findOne({ username: username });
      const { password, updatedAt, ...other } = user._doc;
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  // get friends
  getFriends: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const followingFriends = await Promise.all(
        user.following.map((friendId) => {
          return User.findById(friendId);
        })
      );

      const followersFriends = await Promise.all(
        user.followers.map((friendId) => {
          return User.findById(friendId);
        })
      );

      let friendList = [];

      followingFriends.map((friend) => {
        const { _id, username, profilePicture } = friend;
        friendList.push({ _id, username, profilePicture });
      });

      followersFriends.map((friend) => {
        const { _id, username, profilePicture } = friend;
        friendList.push({ _id, username, profilePicture });
      });

      res.status(200).json(friendList);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  // follow a user
  followUser: async (req, res) => {
    try {
      if (req.body.userId !== req.params.id) {
        try {
          const user = await User.findById(req.params.id);
          const currentUser = await User.findById(req.body.userId);

          if (!user.followers.includes(req.body.userId)) {
            await user.updateOne({ $push: { followers: req.body.userId } });

            await currentUser.updateOne({
              $push: { following: req.params.id },
            });

            res
              .status(200)
              .json({ msg: `You area following the user ${req.body.userId}` });
          } else {
            return res
              .status(403)
              .json({ msg: "You are already following the user" });
          }
        } catch (error) {
          res.status(403).json({ msg: "You are already following this user" });
        }
      }
    } catch (error) {
      res.status(403).json({ msg: "You cannot follow yourself." });
    }
  },

  // unfollow a user
  unfollowUser: async (req, res) => {
    try {
      if (req.body.userId !== req.params.id) {
        try {
          const user = await User.findById(req.params.id);
          const currentUser = await User.findById(req.body.userId);

          if (user.followers.includes(req.body.userId)) {
            await user.updateOne({ $pull: { followers: req.body.userId } });

            await currentUser.updateOne({
              $pull: { following: req.params.id },
            });

            res
              .status(200)
              .json({ msg: `Unfollowing the user ${req.body.userId}` });
          } else {
            return res
              .status(403)
              .json({ msg: "You already unfollowed the user" });
          }
        } catch (error) {
          res.status(403).json(error);
        }
      }
    } catch (error) {
      res.status(403).json({ msg: "You cannot unfollow yourself." });
    }
  },

  // get all users
  getAllUsers: async (req, res) => {
    try {
      let id = req.params.id;

      let uniqueArr = [];
      let friendList = [];

      const user = await User.findById(id);

      const followingFriends = await Promise.all(
        user.following.map((friendId) => {
          return User.findById(friendId);
        })
      );

      const followersFriends = await Promise.all(
        user.followers.map((friendId) => {
          return User.findById(friendId);
        })
      );

      followingFriends.map((friend) => {
        const { _id, username, profilePicture } = friend;
        friendList.push({ _id, username, profilePicture });
      });

      followersFriends.map((friend) => {
        const { _id, username, profilePicture } = friend;
        friendList.push({ _id, username, profilePicture });
      });

      if (friendList) {
        const newUser = await User.find({
          _id: { $nin: friendList.map((friend) => friend._id) },
        });
        if (newUser) {
          let unique = newUser.filter((user) => user._id != id);
          unique.map((user) => {
            const { id, username, profilePicture } = user;
            uniqueArr.push({ id, username, profilePicture });
          });
          res.status(200).json(uniqueArr);
        }
      }
    } catch (error) {
      res.status(403).json(error);
    }
  },
};

module.exports = userCtrl;
