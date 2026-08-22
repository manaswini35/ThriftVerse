import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorText } from "../services/api";
import { Alert, Button, Field, fieldClass } from "../components/ui";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "footwear", "accessories", "other"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "free size"];
const CONDITIONS = ["like new", "good", "fair"];

const MAX_IMAGES = 5;

function Sell() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "tops",
        size: "free size",
        condition: "good",
        brand: "",
    });

    const [images, setImages] = useState([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const pickImages = (e) => {
        const files = [...e.target.files].slice(0, MAX_IMAGES);
        setImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (images.length === 0) {
            return setError("Add at least one photo — nobody buys what they can't see.");
        }

        setBusy(true);

        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => formData.append(key, value));

        // The field name has to be "images" to match upload.array("images", 5).
        images.forEach((file) => formData.append("images", file));

        try {
            const res = await api.post("/products", formData);

            navigate(`/products/${res.data.product._id}`);
        } catch (err) {
            setError(errorText(err, "Could not create the listing."));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-5 py-12">
            <p className="care-label text-fade">One of one</p>

            <h1 className="mt-2 font-display text-3xl font-extrabold">
                List a piece
            </h1>

            <form onSubmit={handleSubmit} className="stitch mt-8 space-y-5 bg-white p-6">
                <Alert>{error}</Alert>

                <Field label="Title">
                    <input
                        type="text"
                        required
                        placeholder="Faded Levi's 501 straight jeans"
                        value={form.title}
                        onChange={set("title")}
                        className={fieldClass}
                    />
                </Field>

                <Field label="Description">
                    <textarea
                        required
                        rows={4}
                        placeholder="Be honest about the wear — it's what makes people trust the listing."
                        value={form.description}
                        onChange={set("description")}
                        className={fieldClass}
                    />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Price (₹)">
                        <input
                            type="number"
                            required
                            min="0"
                            placeholder="1450"
                            value={form.price}
                            onChange={set("price")}
                            className={fieldClass}
                        />
                    </Field>

                    <Field label="Brand (optional)">
                        <input
                            type="text"
                            placeholder="Levi's"
                            value={form.brand}
                            onChange={set("brand")}
                            className={fieldClass}
                        />
                    </Field>

                    <Field label="Category">
                        <select value={form.category} onChange={set("category")} className={fieldClass}>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Size">
                        <select value={form.size} onChange={set("size")} className={fieldClass}>
                            {SIZES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Condition">
                        <select value={form.condition} onChange={set("condition")} className={fieldClass}>
                            {CONDITIONS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label={`Photos (up to ${MAX_IMAGES})`}>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={pickImages}
                        className={`${fieldClass} file:mr-3 file:border-0 file:bg-wash file:px-3 file:py-1`}
                    />
                </Field>

                {images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {images.map((file, i) => (
                            <img
                                key={i}
                                src={URL.createObjectURL(file)}
                                alt=""
                                className="h-20 w-16 object-cover"
                            />
                        ))}
                    </div>
                )}

                <Button type="submit" disabled={busy} className="w-full">
                    {busy ? "Uploading…" : "Put it on the rack"}
                </Button>
            </form>
        </div>
    );
}

export default Sell;
