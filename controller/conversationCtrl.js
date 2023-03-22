const Conversation = require('../model/ConversationModel');
const User = require('../model/userModel')

const ConversationCtrl = {

    // create new conversation
    createConvo : async(req, res) => {
        const newConversation = new Conversation({
            members: [req.body.senderId, req.body.receiverId]
        })

        try {
            const saveConversation = await newConversation.save()
            res.status(200).json(saveConversation)
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // get conversation of user
    getConvo: async(req, res) => {
        try {
            const conversation = await Conversation.find({
                members: {$in: [req.params.userId]}
            })
            res.status(200).json(conversation)
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // get conversation that includes two users
    getBothConvo: async(req, res) => {
        try {
            const conversation = await Conversation.findOne({
                members: {$all: [req.params.firstUserId, req.params.secondUserId]}
            })

            res.status(200).json(conversation)
            
        } catch (error) {
            res.status(500).json(error)
        }
    }
}

module.exports = ConversationCtrl;