import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function Profile() {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProfile();
        fetchMyProducts();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/auth/profile");
            setUser(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchMyProducts = async () => {
        try {
            const res = await api.get("/products/myproducts");
            setProducts(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    if (!user) {
        return <h2>Loading...</h2>;
    }

    return (
        <div style={{ padding: "30px" }}>
            <h1>My Profile</h1>

            <br />

            <h2>{user.name}</h2>

            <p>Email: {user.email}</p>

            <p>Role: {user.role}</p>

            <br />
            <hr />
            <br />

            <h2>My Listings</h2>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    marginTop: "20px",
                }}
            >
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                        />
                    ))
                ) : (
                    <p>You haven't listed any products yet.</p>
                )}
            </div>
        </div>
    );
}

export default Profile;