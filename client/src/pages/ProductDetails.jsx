import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";


function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    if (!product) {
        return <h2>Loading...</h2>;
    }
    const handleDelete = async () => {
    try {
        await api.delete(`/products/${id}`);

        alert("Product deleted successfully");

        navigate("/");
    } catch (error) {
        console.log(error);
        alert(error.response?.data?.message);
    }
};

    return (
        <div>
            <h1>{product.title}</h1>

            <p>{product.description}</p>

            <h2>₹ {product.price}</h2>

            <p>Category: {product.category}</p>

            <p>Seller: {product.seller?.name}</p>

            <p>Email: {product.seller?.email}</p>
            <br />

<Link to={`/edit/${product._id}`}>
    <button>Edit Product</button>
</Link>

<button
    onClick={handleDelete}
    style={{ marginLeft: "10px" }}
>
    Delete Product
</button>
            <Link to={`/products/${product._id}`}>
    View Details
</Link>
        </div>
    );
}

export default ProductDetails;