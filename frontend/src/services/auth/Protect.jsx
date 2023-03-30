import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useRefreshToken from "../../hooks/useRefreshToken";
import Loading from "../../components/Loading";

const Protect = ({ children }) => {
  const refreshAuth = useRefreshToken();
  const { accessToken, loading, setLoading, setUser, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        await refreshAuth();
      } catch (error) {
        console.log("error", error.code);
      } finally {
        isMounted &&
          setTimeout(() => {
            setLoading(false);
          }, 5000);
      }
    };

    !accessToken
      ? verifyAuth()
      : setTimeout(() => {
          setLoading(false);
        }, 5000);

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  if (loading) {
    return <Loading />;
  }

  if (!loading && !accessToken) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default Protect;
