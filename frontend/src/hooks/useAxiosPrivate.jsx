import { useEffect } from "react";
import { axiosPrivate } from "../services/axios/Axios";
import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
  /**
   * This hook define a private "fetcher" for all the requests that need authentication.
   * Inasmuch as the tokens are stored in httpOnly Cookies, we're gonna need
   * credentials to send them to the server and interceptors to refresh the
   * access in each request.
   */

  const { accessToken, CSRFToken, setAccessToken } = useAuth();
  const refreshAuth = useRefreshToken();

  useEffect(() => {
    const req = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          config.headers["X-CSRFToken"] = CSRFToken;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    const res = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (err) => {
        const previousRequest = err?.config;

        if (
          (err?.response?.status === 403 || err?.response?.status === 401) &&
          !previousRequest?.sent
        ) {
          previousRequest.sent = true;
          const { access: newAccess, csrf: newCSRF } = await refreshAuth();
          setAccessToken(newAccess);
          previousRequest.headers["Authorization"] = `Bearer ${newAccess}`;
          previousRequest.headers["X-CSRFToken"] = newCSRF;
          return axiosPrivate(previousRequest);
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(req);
      axiosPrivate.interceptors.response.eject(res);
    };
  }, [accessToken]);

  return axiosPrivate;
};

export default useAxiosPrivate;
