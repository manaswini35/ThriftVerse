import { useState } from "react";
import api from "../services/api";

function Register() {

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Button clicked!");

    try {
        console.log("Before API call");

        const res = await api.post("/auth/register", {
            name,
            email,
            password,
        });

        console.log("After API call");
        console.log(res);

    }catch (error) {
    console.log("Status:", error.response.status);
    console.log("Response:", error.response.data);

    alert(error.response.data.message);
}
};

    return (

        <div>

            <h1>Register</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <br /><br />

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

                    Register

                </button>

            </form>

        </div>

    );

}

export default Register;