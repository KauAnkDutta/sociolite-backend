const fileCtrl = {
    upload: (req, res) => {
        try {
            res.json({msg: "File Upload Works"})
        } catch (error) {
            res.status(500).json(error)
        }
    }
}

module.exports = fileCtrl;