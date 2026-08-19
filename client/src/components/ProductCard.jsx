import { Link } from "react-router-dom";

function ProductCard({ product }) {
    return (
        <div
            style={{
                width: "280px",
                background: "white",
                borderRadius: "10px",
                padding: "15px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
        >
            <img
    src={product.image || "https://via.placeholder.com/250"}
    alt={product.title}
    style={{
        width: "100%",
        height: "220px",
        objectFit: "cover",
        borderRadius: "8px",
    }}
/>

            <h3 style={{ marginTop: "10px" }}>
                {product.title}
            </h3>

            <p>{product.description}</p>

            <h2>₹ {product.price}</h2>

            <p>{product.category}</p>

            <Link to={`/products/${product._id}`}>
                View Details
            </Link>
        </div>
    );
}

export default ProductCard;