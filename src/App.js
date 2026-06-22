import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout     from "./components/Layout";
import Login      from "./pages/Login";
import Dashboard  from "./pages/Dashboard";
import Shops      from "./pages/Shops";
import ShopForm   from "./pages/ShopForm";
import ShopView   from "./pages/ShopView";
import Workers    from "./pages/Workers";
import Customers  from "./pages/Customers";
import OpenAICost from "./pages/OpenAICost";
import AuditLog   from "./pages/AuditLog";

const authed = () => !!localStorage.getItem("bp_token");

function Guard({ children }) {
    return authed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Guard><Layout /></Guard>}>
                    <Route index              element={<Dashboard />} />
                    <Route path="shops"       element={<Shops />} />
                    <Route path="shops/new"   element={<ShopForm />} />
                    <Route path="shops/:id"   element={<ShopView />} />
                    <Route path="shops/:id/edit" element={<ShopForm />} />
                    <Route path="shops/:id/workers"   element={<Workers />} />
                    <Route path="shops/:id/customers" element={<Customers />} />
                    <Route path="openai"      element={<OpenAICost />} />
                    <Route path="audit"       element={<AuditLog />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
