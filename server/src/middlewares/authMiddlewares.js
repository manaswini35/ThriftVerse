import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "No token provided",
        });
    }

    const token = header.split(" ")[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        // An expired token isn't a server fault — say so plainly so the
        // client can clear it and send the user back to login.
        const expired = error.name === "TokenExpiredError";

        return res.status(401).json({
            message: expired
                ? "Session expired. Please log in again."
                : "Invalid token",
            expired,
        });
    }
};

export default protect;
