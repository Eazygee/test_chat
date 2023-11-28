
const { validResponse, problemResponse } = require('../../../app/helpers/response');
const { SERVER_ERROR_CODE, NOTFOUND_ERROR_CODE } = require('../../../app/constants/ApiConstants');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const model = require('../../../models');

const Register = async (req, res) => {
    const User = model.User;
    const transaction = await model.sequelize.transaction();

    try {
        const body = req.body;
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const data = await User.create({
            name: body.name,
            email: body.email,
            password: hashedPassword,
        }, { transaction });

        const accessToken = jwt.sign({ user_id: data.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const responseData = {
            id: data.id,
            name: data.name,
            email: data.email,
            token: accessToken
        };
        await transaction.commit();
        res.status(201).json(validResponse("User registered successfully", responseData));
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json(problemResponse("Validation error", error.errors.map(e => e.message)));
        } else {
            // Send a generic error response
            res.status(500).json(problemResponse("Something went wrong"));
        }
    }
}

const Login = async (req, res) => {
    try {
        const User = model.User;
        const body = req.body;
        const { email, password } = body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json(problemResponse("User not found", null, NOTFOUND_ERROR_CODE));
        }
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log(token);
            const responseData = {
                name: user.name,
                email: user.email,
                token: token
            };
            res.status(201).json(validResponse("User loggedin successfully", responseData));
        } else {
            res.status(401).json(problemResponse("Invalid Credentials", null, SERVER_ERROR_CODE));
        }

    } catch (error) {
        console.error(error);
        res.status(500).json(problemResponse(null, error, SERVER_ERROR_CODE));
    }
}


module.exports = { Register, Login }