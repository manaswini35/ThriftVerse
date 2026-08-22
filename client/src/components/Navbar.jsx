import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

const linkClass = ({ isActive }) =>
    `care-label transition hover:text-stitch ${
        isActive ? "text-stitch" : "text-bone/70"
    }`;

function Navbar() {
    // Reads the session from context rather than poking localStorage, so the
    // bar re-renders the moment you log in or your token expires.
    const { user, logout } = useAuth();
    const { ids } = useWishlist();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="sticky top-0 z-50 bg-ink text-bone">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
                <Link to="/" className="font-display text-xl font-extrabold">
                    ThriftVerse
                </Link>

                <div className="flex items-center gap-5">
                    <NavLink to="/" className={linkClass}>
                        Browse
                    </NavLink>

                    <NavLink to="/saved" className={linkClass}>
                        Saved{ids.length > 0 && ` (${ids.length})`}
                    </NavLink>

                    {user ? (
                        <>
                            <NavLink to="/sell" className={linkClass}>
                                Sell
                            </NavLink>

                            <NavLink to="/profile" className={linkClass}>
                                {user.name?.split(" ")[0] || "Profile"}
                            </NavLink>

                            <button
                                onClick={handleLogout}
                                className="care-label text-bone/70 transition hover:text-stamp"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={linkClass}>
                                Log in
                            </NavLink>

                            <Link
                                to="/register"
                                className="care-label bg-stitch px-4 py-2 text-ink transition hover:bg-white"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
