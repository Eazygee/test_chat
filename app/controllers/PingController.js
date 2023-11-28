

const ping = (req, res) => {
    console.log("rnfjnf");
     res.status(200).json({ message: 'Ping successful!' });
}

module.exports = { ping }