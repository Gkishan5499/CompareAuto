import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

interface JwtPayload {
  exp: number;
  username: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("admin_user");
    const token = localStorage.getItem("admin_token");

    if (!raw || !token) return null;

    try {
      const decoded: JwtPayload = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.clear();
        return null;
      }

      return JSON.parse(raw);
    } catch {
      localStorage.clear();
      return null;
    }
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);

    const res = await client.post("/api/auth/login", { username, password });
    const { token, user: loggedUser } = res.data;

    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(loggedUser));

    setUser(loggedUser);
    setLoading(false);

    return loggedUser;
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
