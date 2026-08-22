import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { errorText } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { coverImage } from "../components/ProductCard";
import { Alert, Button, money, Spinner, Tag } from "../components/ui";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();
    const { has, toggle } = useWishlist();

    const [product, setProduct] = useState(null);
    const [active, setActive] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
        setProduct(null);
        setActive(0);

        api
            .get(`/products/${id}`)
            .then((res) => setProduct(res.data))
            .catch((err) => setError(errorText(err, "Could not load that listing.")));
    }, [id]);

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

    return (
        <div className="mx-auto max-w-5xl px-5 py-10">
            <Alert>{error}</Alert>

            <div className="grid gap-10 md:grid-cols-2">
                <div>
                    <div className="relative aspect-4/5 overflow-hidden bg-wash">
                        <img
                            src={gallery[active]}
                            alt={product.title}
                            className="h-full w-full object-cover"
                        />

                        {product.status === "sold" && (
                            <span className="absolute inset-0 flex items-center justify-center bg-ink/70">
                                <span className="care-label border-2 border-bone px-4 py-2 text-bone">
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
                                    className={`h-20 w-16 overflow-hidden border-2 ${
                                        i === active ? "border-ink" : "border-transparent"
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

                    <p className="mt-3 font-mono text-2xl">{money(product.price)}</p>

                    <div className="stitch-t mt-5 flex flex-wrap gap-1.5 pt-4">
                        <Tag>{product.size || "free size"}</Tag>
                        <Tag>{product.condition || "good"}</Tag>
                        {product.brand && <Tag tone="stitch">{product.brand}</Tag>}
                    </div>

                    <p className="mt-6 whitespace-pre-line text-ink/80">
                        {product.description}
                    </p>

                    <div className="stitch-t mt-8 pt-4">
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
        </div>
    );
}

export default ProductDetails;
