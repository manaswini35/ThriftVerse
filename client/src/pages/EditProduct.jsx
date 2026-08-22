import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { errorText } from "../services/api";
import { coverImage } from "../components/ProductCard";
import { Alert, Button, Field, fieldClass, Spinner } from "../components/ui";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "footwear", "accessories", "other"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "free size"];
const CONDITIONS = ["like new", "good", "fair"];

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [images, setImages] = useState([]);
    const [existing, setExisting] = useState([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api
            .get(`/products/${id}`)
            .then(({ data }) => {
                setForm({
                    title: data.title || "",
                    description: data.description || "",
                    price: data.price ?? "",
                    category: data.category || "other",
                    size: data.size || "free size",
                    condition: data.condition || "good",
                    brand: data.brand || "",
                    status: data.status || "available",
                });

                setExisting(data.images?.length ? data.images : [coverImage(data)]);
            })
            .catch((err) => setError(errorText(err, "Could not load that listing.")));
    }, [id]);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setBusy(true);

        try {
            if (images.length > 0) {
                // New files mean a multipart request; the server swaps the
                // whole image set for the uploaded one.
                const formData = new FormData();

                Object.entries(form).forEach(([k, v]) => formData.append(k, v));
                images.forEach((file) => formData.append("images", file));

                await api.put(`/products/${id}`, formData);
            } else {
                await api.put(`/products/${id}`, form);
            }

            navigate(`/products/${id}`);
        } catch (err) {
            setError(errorText(err, "Could not save your changes."));
        } finally {
            setBusy(false);
        }
    };

    if (!form) {
        return error ? (
            <div className="mx-auto max-w-2xl px-5 py-12">
                <Alert>{error}</Alert>
            </div>
        ) : (
            <Spinner label="Loading listing" />
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-5 py-12">
            <h1 className="font-display text-3xl font-extrabold">Edit listing</h1>

            <form onSubmit={handleSubmit} className="stitch mt-8 space-y-5 bg-white p-6">
                <Alert>{error}</Alert>

                <Field label="Title">
                    <input type="text" required value={form.title} onChange={set("title")} className={fieldClass} />
                </Field>

                <Field label="Description">
                    <textarea required rows={4} value={form.description} onChange={set("description")} className={fieldClass} />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Price (₹)">
                        <input type="number" required min="0" value={form.price} onChange={set("price")} className={fieldClass} />
                    </Field>

                    <Field label="Brand (optional)">
                        <input type="text" value={form.brand} onChange={set("brand")} className={fieldClass} />
                    </Field>

                    <Field label="Category">
                        <select value={form.category} onChange={set("category")} className={fieldClass}>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>

                    <Field label="Size">
                        <select value={form.size} onChange={set("size")} className={fieldClass}>
                            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </Field>

                    <Field label="Condition">
                        <select value={form.condition} onChange={set("condition")} className={fieldClass}>
                            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>

                    <Field label="Status">
                        <select value={form.status} onChange={set("status")} className={fieldClass}>
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                        </select>
                    </Field>
                </div>

                <div>
                    <p className="care-label text-fade">Current photos</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {existing.map((src, i) => (
                            <img key={i} src={src} alt="" className="h-20 w-16 object-cover" />
                        ))}
                    </div>
                </div>

                <Field label="Replace photos (optional)">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setImages([...e.target.files].slice(0, 5))}
                        className={`${fieldClass} file:mr-3 file:border-0 file:bg-wash file:px-3 file:py-1`}
                    />
                </Field>

                <div className="flex gap-3">
                    <Button type="submit" disabled={busy}>
                        {busy ? "Saving…" : "Save changes"}
                    </Button>

                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default EditProduct;
