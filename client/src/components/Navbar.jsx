import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

const linkClass = ({ isActive }) =>
    `care-label relative py-1 transition hover:text-stitch ${
        isActive
            ? "text-stitch after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-stitch"
            : "text-bone/70"
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
        <nav className="sticky top-0 z-50 border-b border-bone/10 bg-ink/95 text-bone backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5">
                <Link to="/" className="group flex items-baseline gap-2">
                    <span className="wordmark-sm text-2xl sm:text-3xl">
                        ThriftVerse
                    </span>
                    <span className="care-label hidden text-bone/40 transition group-hover:text-stitch sm:inline">
                        est. pre-loved
                    </span>
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
                                className="care-label rounded-full bg-stitch px-4 py-2 text-ink shadow-[0_0_0_0_rgba(224,163,46,0.5)] transition hover:shadow-[0_0_22px_2px_rgba(224,163,46,0.45)]"
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
