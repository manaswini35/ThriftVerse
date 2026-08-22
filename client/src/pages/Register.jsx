import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorText } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Alert, Button, Field, fieldClass } from "../components/ui";

function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("buyer");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (password.length < 6) {
            return setError("Password must be at least 6 characters.");
        }

        setBusy(true);

        try {
            const res = await api.post("/auth/register", {
                name,
                email,
                password,
                role,
            });

            // The server hands back a token on register, so there's no reason
            // to make someone log in again immediately.
            login(res.data.token, res.data.user);

            navigate("/", { replace: true });
        } catch (err) {
            setError(errorText(err, "Could not register. Try again."));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mx-auto max-w-md px-5 py-16">
            <p className="care-label text-fade">Join the rack</p>

            <h1 className="mt-2 font-display text-3xl font-extrabold">
                Create an account
            </h1>

            <form onSubmit={handleSubmit} className="stitch mt-8 space-y-5 bg-white p-6">
                <Alert>{error}</Alert>

                <Field label="Name">
                    <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={fieldClass}
                    />
                </Field>

                <Field label="Email">
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={fieldClass}
                    />
                </Field>

                <Field label="Password">
                    <input
                        type="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={fieldClass}
                    />
                </Field>

                <Field label="I'm here to">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={fieldClass}
                    >
                        <option value="buyer">Buy</option>
                        <option value="seller">Sell my own pieces</option>
                    </select>
                </Field>

                <Button type="submit" disabled={busy} className="w-full">
                    {busy ? "Creating…" : "Create account"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-fade">
                Already have an account?{" "}
                <Link to="/login" className="text-denim underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}

export default Register;
