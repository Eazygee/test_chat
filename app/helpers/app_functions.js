const { User } = require("../../models/UserModel");
const { validResponse, problemResponse } = require("./response");

const authUser = async (req, res, relationship = null) => {
    try {
        const requestUser = req.user; 
        const user = await User.findOne({
            where: {
                id: requestUser.user_id, 
            },
            include: { relationship }
        });
        return user;
    } catch (error) {
        console.error(error);
        res.status(500).json(problemResponse("Something went wrong"));
    }
};

const generateBatchNo = () => {
    const timestamp = new Date().getTime();
    const randomDigits = Math.floor(Math.random() * 100)
    const batchNumber = `${timestamp}${randomDigits}`;
    return batchNumber;
}

module.exports = { authUser, generateBatchNo };
