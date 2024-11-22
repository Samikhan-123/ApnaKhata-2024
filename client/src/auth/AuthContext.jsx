import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create the Auth context
const AuthContext = createContext();

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component to wrap the app
// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Set Axios default header if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"]; // Remove header if no token
    }
  }, [token]);

  // Login function to update the user and token states
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("user", JSON.stringify(userData)); // Save user to local storage
    localStorage.setItem("token", userToken); // Save token to local storage
  };

  // Logout function to clear the user and token
  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user"); // Clear user from local storage
    localStorage.removeItem("token"); // Clear token from local storage
    delete axios.defaults.headers.common["Authorization"];

    // Clear Google Auth state
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(user?.email, () => {
        console.log('Google consent revoked'); 
      });
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
