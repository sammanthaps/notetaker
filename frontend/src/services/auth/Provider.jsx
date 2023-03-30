import { useState } from "react";
import Context from "./Context";

const Provider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [CSRFToken, setCSRFToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() =>
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  let value = {
    accessToken: accessToken,
    setAccessToken: setAccessToken,
    refreshToken: refreshToken,
    setrefreshToken: setRefreshToken,
    CSRFToken: CSRFToken,
    setCSRFToken: setCSRFToken,
    loading: loading,
    setLoading: setLoading,
    user: user,
    setUser: setUser,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default Provider;
