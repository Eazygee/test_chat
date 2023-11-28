const validResponse = (message = null, data = null, token = null, request = null) => {
    if (data === null || data === undefined || Object.keys(data).length === 0) {
        data = null;
    }

    const body = {
        message: message,
        token: token || null,
        data: data,
        success: true,
        code: 200,
    };

    if (token === null || token === undefined || token === '') {
        delete body.token;
    }

    return body;
}

const problemResponse = (message = null, error = null, code = null) => {
    // console.log(error.errors[];
    const body = {
        message: message ?? null,
        success: false,
        code: code ?? null
    };
    return body;
}

module.exports = { validResponse, problemResponse }