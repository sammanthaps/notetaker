import { createContext } from "react";

const Context = createContext({
  accessToken: null,
  refreshToken: null,
  CSRFToken: null,
  loading: null,
  user: null,
  setAccessToken: () => {},
  setRefreshToken: () => {},
  setCSRFToken: () => {},
  setLoading: () => {},
  setUser: () => {},
});

export default Context;
