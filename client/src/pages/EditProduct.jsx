import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);

            setTitle(res.data.title);
            setDescription(res.data.description);
            setPrice(res.data.price);
            setCategory(res.data.category);
            setImage(res.data.image);

        } catch (error) {
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.put(`/products/${id}`, {
                title,
                description,
                price,
                category,
                image,
            });

            alert("Product updated successfully");

            navigate(`/products/${id}`);

        } catch (error) {
            alert(error.response?.data?.message);
        }
    };

    return (
        <div style={{ padding: "30px" }}>
            <h1>Edit Product</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <br /><br />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <br /><br />

                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <br /><br />

                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />

                <br /><br />

                <input
                    type="text"
                    placeholder="Image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                />

                <br /><br />

                <button type="submit">
                    Update Product
                </button>

            </form>
        </div>
    );
}

export default EditProduct;