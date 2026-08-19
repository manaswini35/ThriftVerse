import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];

        console.log("Received Token:", token);
        console.log("JWT Secret:", process.env.JWT_SECRET);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            console.log("Decoded:", decoded);

            req.user = decoded;

            next();
        } catch (error) {
            console.log(error);

            return res.status(401).json({
                message: error.message,
            });
        }
    } else {
        return res.status(401).json({
            message: "No token provided",
        });
    }
};

export default protect;