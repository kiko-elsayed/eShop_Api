
function errorHandler(req,res,err,next) {
    if (err && err.name === 'UnauthorizedError') {
        return res.status(401).json({message : "user in not authorized"})
    }
    if (err && err.name === 'ValidationError') {
        return res.status(401).json({message : error.message})
    }

    return res.status(500).json({ message: 'Internal Server Error' });
}

module.exports = errorHandler