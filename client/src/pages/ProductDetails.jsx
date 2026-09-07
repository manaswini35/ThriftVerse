import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { errorText } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { coverImage } from "../components/ProductCard";
import { Alert, Button, money, Spinner, Tag } from "../components/ui";
import VirtualTryOnModal from "../components/VirtualTryOn/VirtualTryOnModal";
import { tryOnFor } from "../components/VirtualTryOn/fit";
import { fetchTryOnStatus } from "../services/tryOn";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();
    const { has, toggle } = useWishlist();

    const [product, setProduct] = useState(null);
    const [active, setActive] = useState(0);
    const [error, setError] = useState("");

    const [tryOnOpen, setTryOnOpen] = useState(false);
    // Asked once per page load. If the server has no provider key we say so
    // rather than offering a button that can only disappoint.
    const [tryOnReady, setTryOnReady] = useState(null);

    useEffect(() => {
        setProduct(null);
        setActive(0);

        api
            .get(`/products/${id}`)
            .then((res) => setProduct(res.data))
            .catch((err) => setError(errorText(err, "Could not load that listing.")));
    }, [id]);

    useEffect(() => {
        let cancelled = false;

        fetchTryOnStatus()
            .then((data) => !cancelled && setTryOnReady(Boolean(data.configured)))
            .catch(() => !cancelled && setTryOnReady(false));

        return () => {
            cancelled = true;
        };
    }, []);

    const handleDelete = async () => {
        if (!confirm("Delete this listing permanently?")) return;

        try {
            await api.delete(`/products/${id}`);
            navigate("/");
        } catch (err) {
            setError(errorText(err, "Could not delete the listing."));
        }
    };

    if (error && !product) {
        return (
            <div className="mx-auto max-w-3xl px-5 py-12">
                <Alert>{error}</Alert>
            </div>
        );
    }

    if (!product) return <Spinner label="Fetching the tag" />;

    const gallery = product.images?.length ? product.images : [coverImage(product)];

    // seller is populated, so compare against its _id — comparing the whole
    // object to a user id never matches.
    const isOwner = user && product.seller?._id === user._id;
    const saved = has(product._id);

    const tryOn = tryOnFor(product);
    const canTryOn = tryOn.supported && product.status !== "sold";

    return (
        <div className="mx-auto max-w-5xl px-5 py-10">
            <Alert>{error}</Alert>

            <div className="grid gap-10 md:grid-cols-2">
                <div>
                    <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-wash shadow-[0_30px_60px_-40px_rgba(20,22,43,0.8)]">
                        <img
                            src={gallery[active]}
                            alt={product.title}
                            className="h-full w-full object-cover"
                        />

                        {product.status === "sold" && (
                            <span className="absolute inset-0 flex items-center justify-center bg-ink/70">
                                <span className="care-label rotate-[-8deg] border-2 border-stamp px-4 py-2 text-stamp">
                                    Sold
                                </span>
                            </span>
                        )}
                    </div>

                    {gallery.length > 1 && (
                        <div className="mt-3 flex gap-2">
                            {gallery.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActive(i)}
                                    aria-label={`Photo ${i + 1}`}
                                    className={`h-20 w-16 overflow-hidden rounded-lg border-2 transition ${
                                        i === active
                                            ? "border-stamp"
                                            : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    <img src={src} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <p className="care-label text-stitch">1 of 1 · {product.category}</p>

                    <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold">
                        {product.title}
                    </h1>

                    <p className="price-tag mt-4 inline-block rotate-[-2deg] px-3 py-1.5 text-2xl font-medium">
                        {money(product.price)}
                    </p>

                    {canTryOn && (
                        <div className="mt-5">
                            <button
                                onClick={() =>
                                    user
                                        ? setTryOnOpen(true)
                                        : navigate("/login", {
                                              state: { from: `/products/${product._id}` },
                                          })
                                }
                                disabled={tryOnReady === false}
                                className="care-label w-full rounded-full bg-gradient-to-r from-stitch via-stamp to-denim px-6 py-3.5 text-bone transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 sm:w-auto"
                            >
                                ✨ AI Try-On
                            </button>

                            <p className="care-label mt-2 text-fade">
                                {tryOnReady === false
                                    ? "Try-on isn't switched on yet — the server needs an AI key."
                                    : user
                                      ? "See it on you before you commit"
                                      : "Log in to try this on"}
                            </p>
                        </div>
                    )}

                    {!tryOn.supported && tryOn.reason && (
                        <p className="care-label mt-5 text-fade">{tryOn.reason}</p>
                    )}

                    <div className="stitch-t mt-5 flex flex-wrap gap-1.5 pt-4">
                        <Tag>{product.size || "free size"}</Tag>
                        <Tag>{product.condition || "good"}</Tag>
                        {product.brand && <Tag tone="stitch">{product.brand}</Tag>}
                    </div>

                    <p className="mt-6 whitespace-pre-line text-ink/80">
                        {product.description}
                    </p>

                    <div className="mt-8 rounded-2xl border border-wash bg-white p-5">
                        <p className="care-label text-fade">Listed by</p>

                        <p className="mt-1 font-display text-lg">
                            {product.seller?.name || "Unknown seller"}
                        </p>

                        {product.seller?.location && (
                            <p className="text-sm text-fade">{product.seller.location}</p>
                        )}

                        {product.seller?.bio && (
                            <p className="mt-2 text-sm text-ink/70">{product.seller.bio}</p>
                        )}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        {user && (
                            <Button
                                variant="outline"
                                onClick={() => toggle(product._id)}
                            >
                                {saved ? "♥ Saved" : "♡ Save"}
                            </Button>
                        )}

                        {isOwner ? (
                            <>
                                <Link to={`/edit/${product._id}`}>
                                    <Button variant="outline">Edit listing</Button>
                                </Link>

                                <Button variant="danger" onClick={handleDelete}>
                                    Delete
                                </Button>
                            </>
                        ) : (
                            product.seller?.email && (
                                <a href={`mailto:${product.seller.email}?subject=${encodeURIComponent(product.title)}`}>
                                    <Button>Contact seller</Button>
                                </a>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Rendered only while open so the camera/object URLs are torn
                down the moment the customer leaves. */}
            {tryOnOpen && (
                <VirtualTryOnModal
                    product={product}
                    garmentImage={tryOn.garmentImage}
                    fitGuide={tryOn.fitGuide}
                    saved={saved}
                    onSave={user ? () => toggle(product._id) : null}
                    onClose={() => setTryOnOpen(false)}
                />
            )}
        </div>
    );
}

export default ProductDetails;
