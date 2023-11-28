

const ping = (req, res) => {
    res.status(200).json({ message: 'Ping successful!' });
}

module.exports = { ping }