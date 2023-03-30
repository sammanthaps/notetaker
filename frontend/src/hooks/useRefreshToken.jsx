import { axiosPrivate } from "../services/axios/Axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  /**
   * Get the CSRF Token and a new Access Token.
   */
  const { setAccessToken, setCSRFToken } = useAuth();

  const refreshAuth = async () => {
    let tokens;

    try {
      const response = await axiosPrivate({
        method: "post",
        url: "/api/login/refresh",
      });

      setAccessToken(response.data.access);
      setCSRFToken(response.headers.get("X-CSRFToken"));

      tokens = {
        access: response.data.access,
        csrf: response.headers["X-CSRFToken"],
      };
    } catch (error) {
      console.log("error", error);
    }
    return tokens;
  };
  return refreshAuth;
};

export default useRefreshToken;
