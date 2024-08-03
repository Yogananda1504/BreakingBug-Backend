const jwt = require("jsonwebtoken");

// Middleware to authenticate JWT token
const authMiddleware = (req, res, next) => {

	const token1 = req.header("Authorization")//Bug :Previously it was not configured to split the token from the header
    const token = token1.split(" ")[1]//Bug :Previously it was not configured to split the token from the header
   


    if (!token) {
        // Bug: Changed from res.status(401).json to include correct status and message
        return res.status(401).json({ message: "Authorization token not found" }); // Status 401 for unauthorized access
    }

    try {
        // Bug: Changed from jwt.env to jwt.verify for decoding the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Use jwt.verify to decode the token
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        // Bug: Updated message to reflect invalid token error
        return res.status(401).json({ message: "Invalid token" }); // Status 401 for unauthorized access
    }
};

module.exports = authMiddleware;