import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorText } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import { Alert, Button, Empty, Spinner } from "../components/ui";

function Profile() {
    // The session already holds the user — no need to refetch the profile
    // just to render a name.
    const { user, loading } = useAuth();

    const [products, setProducts] = useState([]);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;

        api
            .get("/products/myproducts")
            .then((res) => setProducts(res.data))
            .catch((err) => setError(errorText(err, "Could not load your listings.")))
            .finally(() => setBusy(false));
    }, [user]);

    if (loading) return <Spinner label="Checking your session" />;

    return (
        <div className="mx-auto max-w-6xl px-5 py-10">
            <div className="stitch flex flex-wrap items-center gap-5 bg-white p-6">
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt=""
                        className="h-16 w-16 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-wash font-display text-xl">
                        {user.name?.[0]?.toUpperCase()}
                    </div>
                )}

                <div>
                    <h1 className="font-display text-2xl font-extrabold">{user.name}</h1>
                    <p className="text-sm text-fade">{user.email}</p>
                    <p className="care-label mt-1 text-denim">{user.role}</p>
                </div>

                <Link to="/sell" className="ml-auto">
                    <Button>List a piece</Button>
                </Link>
            </div>

            <h2 className="mt-10 font-display text-xl font-extrabold">My listings</h2>

            <div className="mt-4">
                <Alert>{error}</Alert>
            </div>

            {busy ? (
                <Spinner label="Pulling your rack" />
            ) : products.length === 0 ? (
                <Empty
                    title="Nothing listed yet"
                    body="The first piece is the hardest. After that it's a habit."
                >
                    <Link to="/sell" className="mt-4">
                        <Button>List your first piece</Button>
                    </Link>
                </Empty>
            ) : (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Profile;
