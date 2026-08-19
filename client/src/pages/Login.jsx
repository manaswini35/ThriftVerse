import { useState } from "react";
import api from "../services/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
           const res = await api.post("/auth/login", {
    email,
    password,
});

localStorage.setItem("token", res.data.token);

alert(res.data.message);

console.log("Token saved:", localStorage.getItem("token"));

        } catch (error) {
            alert(error.response.data.message);
        }
    };
    const getProfile = async () => {
    try {
        const res = await api.get("/auth/profile");

        console.log(res.data);
        alert("Welcome " + res.data.name);

    } catch (error) {
        console.log(error.response.data);
    }
};
   


    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br /><br />

                <button type="submit">
                    Login
                </button>
                <button onClick={getProfile}>
    Get Profile
</button>
            </form>
        </div>
    );
}

export default Login;