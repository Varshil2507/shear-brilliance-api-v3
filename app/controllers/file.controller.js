const path = require('path');

exports.getImage = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("Error fetching image:", err);
            res.status(404).send({ message: "Image not found." });
        }
    });
};