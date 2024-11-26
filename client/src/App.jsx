// src/App.jsx
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ExpenseForm from "./pages/PostExpenses";
import ExpenseTable from "./pages/ViewData";
import EditExpense from "./pages/EditUserExpense";
import ForgotPasswordPage from "./pages/ForgetPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import PrivateRoute from "./auth/PrivateRotes";
import NotFoundRedirect from "./pages/NoRouteFound";
// import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/:resetToken"
          element={<ResetPasswordPage />}
        />

        {/* Protected Routes */}
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <ExpenseForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <ExpenseTable />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-expense/:id"
          element={
            <PrivateRoute>
              <EditExpense />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
