import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import { Button, Empty, Spinner } from "../components/ui";

function Saved() {
    const { ids } = useWishlist();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (ids.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        // Saved ids live in localStorage, so some may point at listings that
        // have since been deleted — allSettled keeps one 404 from blanking
        // the whole page.
        Promise.allSettled(ids.map((id) => api.get(`/products/${id}`)))
            .then((results) => {
                if (cancelled) return;

                setProducts(
                    results
                        .filter((r) => r.status === "fulfilled")
                        .map((r) => r.value.data)
                );
            })
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, [ids]);

    return (
        <div className="mx-auto max-w-6xl px-5 py-10">
            <p className="care-label text-fade">Your rail</p>

            <h1 className="mt-2 font-display text-3xl font-extrabold">Saved pieces</h1>

            {loading ? (
                <Spinner label="Finding what you saved" />
            ) : products.length === 0 ? (
                <Empty
                    title="Nothing saved yet"
                    body="Tap the heart on any listing and it'll wait for you here."
                >
                    <Link to="/" className="mt-4">
                        <Button>Browse the rack</Button>
                    </Link>
                </Empty>
            ) : (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Saved;
