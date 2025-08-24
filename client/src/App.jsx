import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ExpenseForm from "./pages/PostExpenses";
import EditExpense from "./pages/EditUserExpense";
import ForgotPasswordPage from "./pages/ForgetPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import PrivateRoute from "./auth/PrivateRotes";
import Analytics from "./pages/Analytics";
import NoRouteFound from "./pages/NoRouteFound";
import ViewData from "./pages/ViewData";
import ErrorBoundary from "./components/ErrorBoundary"; 

function App() {
  return (
    <Router>
      <Header />
      <ErrorBoundary>
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
                <ViewData />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
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
          <Route path="*" element={<NoRouteFound />} />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </Router>
  );
}

export default App;
