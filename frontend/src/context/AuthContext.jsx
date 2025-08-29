import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: response.data.user, token: state.token },
      });
    } catch (error) {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      dispatch({ type: "LOGOUT" });
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: data.user, token: data.token },
      });
      localStorage.setItem("token", data.token);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        userData
      );
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    dispatch({ type: "LOGOUT" });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
