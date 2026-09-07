import { Link } from "react-router-dom";

// The sign painted on the shutter after closing. Mostly the wordmark again,
// because a shop should say its name twice.
function Footer() {
    return (
        <footer className="relative mt-20 overflow-hidden bg-ink text-bone">
            <div className="pointer-events-none absolute inset-0 hero-glow opacity-70" />

            <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-10">
                <div className="flex flex-wrap items-start justify-between gap-8">
                    <div>
                        <p className="font-display text-4xl font-extrabold sm:text-5xl">
                            Buy one.{" "}
                            <span className="text-stitch">Save nine.</span>
                        </p>

                        <p className="mt-3 max-w-md text-sm text-bone/60">
                            Roughly nine thousand litres of water go into one new
                            pair of jeans. Buying this pair costs none of it.
                        </p>
                    </div>

                    <div className="flex gap-12">
                        <div className="flex flex-col gap-2.5">
                            <p className="care-label text-bone/35">Shop</p>
                            <Link to="/" className="care-label text-bone/75 hover:text-stitch">
                                Browse
                            </Link>
                            <Link to="/saved" className="care-label text-bone/75 hover:text-stitch">
                                Saved
                            </Link>
                            <Link to="/sell" className="care-label text-bone/75 hover:text-stitch">
                                Sell yours
                            </Link>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <p className="care-label text-bone/35">Account</p>
                            <Link to="/login" className="care-label text-bone/75 hover:text-stitch">
                                Log in
                            </Link>
                            <Link to="/register" className="care-label text-bone/75 hover:text-stitch">
                                Register
                            </Link>
                            <Link to="/profile" className="care-label text-bone/75 hover:text-stitch">
                                Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* The wordmark one more time, oversized and cropped by the
                    bottom of the page like a shopfront sign. */}
                <p className="wordmark mt-10 -mb-3 opacity-25 select-none">
                    ThriftVerse
                </p>

                <p className="care-label mt-6 border-t border-bone/10 pt-5 text-bone/35">
                    ThriftVerse · every piece one of one · made with second-hand
                    love
                </p>
            </div>
        </footer>
    );
}

export default Footer;
