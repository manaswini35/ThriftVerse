import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api, { errorText } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Alert, Button, Field, fieldClass } from "../components/ui";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    // Set by ProtectedRoute when it bounced you here — go back where you were
    // headed instead of dumping you on the home page.
    const next = location.state?.from || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setBusy(true);

        try {
            const res = await api.post("/auth/login", { email, password });

            // Goes through the context, not localStorage directly, so the
            // navbar and wishlist update without a page reload.
            login(res.data.token, res.data.user);

            navigate(next, { replace: true });
        } catch (err) {
            setError(errorText(err, "Could not log in. Try again."));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mx-auto max-w-md px-5 py-16">
            <p className="care-label text-fade">Welcome back</p>

            <h1 className="mt-2 font-display text-3xl font-extrabold">Log in</h1>

            <form onSubmit={handleSubmit} className="stitch mt-8 space-y-5 bg-white p-6">
                <Alert>{error}</Alert>

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
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={fieldClass}
                    />
                </Field>

                <Button type="submit" disabled={busy} className="w-full">
                    {busy ? "Logging in…" : "Log in"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-fade">
                No account yet?{" "}
                <Link to="/register" className="text-denim underline">
                    Register
                </Link>
            </p>
        </div>
    );
}

export default Login;
