import { Routes, Route, Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { Button, Empty } from "./components/ui";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Saved from "./pages/Saved";
import Sell from "./pages/Sell";
import ProductDetails from "./pages/ProductDetails";
import EditProduct from "./pages/EditProduct";

function NotFound() {
    return (
        <Empty title="That rail is empty" body="The page you asked for doesn't exist.">
            <Link to="/" className="mt-4">
                <Button>Back to browsing</Button>
            </Link>
        </Empty>
    );
}

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/saved" element={<Saved />} />

                {/* Anything that needs a session goes through ProtectedRoute,
                    so these pages never render against a null user. */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/sell"
                    element={
                        <ProtectedRoute>
                            <Sell />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditProduct />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />
        </>
    );
}

export default App;
