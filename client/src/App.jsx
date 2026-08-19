import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import EditProduct from "./pages/EditProduct";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Sell from "./pages/Sell";
import ProductDetails from "./pages/ProductDetails";

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/profile" element={<Profile />} />

                <Route path="/sell" element={<Sell />} />
                <Route path="/edit/:id" element={<EditProduct />} />

                <Route
                    path="/products/:id"
                    element={<ProductDetails />}
                />
            </Routes>
        </>
    );
}

export default App;