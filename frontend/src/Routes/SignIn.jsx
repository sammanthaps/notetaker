import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios/Axios";
import useAuth from "../hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PasswordRecovery from "./PasswordRecovery";

const SignIn = () => {
  const navigate = useNavigate();
  const { setAccessToken, setRefreshToken, setCSRFToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayRecover, setDisplayRecover] = useState(false);
  const [activationLink, setActivationLink] = useState(false);

  const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  };

  const login = async () => {
    try {
      const response = await axiosInstance({
        method: "post",
        url: "/api/login",
        data: {
          email: email,
          password: password,
        },
      });
      navigate("/dashboard");
      setAccessToken(response.data.access);
      setRefreshToken(response.data.refresh);
      setCSRFToken(response.headers.get("X-CSRFToken"));
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response?.data?.error, toastConfig);
      }

      if (error.response?.data?.activation) {
        setActivationLink(true);
      }
      setLoading(false);
    }
  };

  const sendLinkAgain = async () => {
    setActivationLink(false);
    toast.info(
      "We're sending you an email with the activation link...",
      toastConfig
    );

    try {
      const response = await axiosInstance({
        method: "put",
        url: "/api/account",
        data: {
          email: email,
        },
      });
      toast.success(response.data.success, toastConfig);
    } catch (error) {
      if (error?.response?.data?.error) {
        toast.error(error?.response?.data?.error, toastConfig);
      }
    }
  };

  return (
    <section className="home-auth-content flex">
      <div className="home-auth">
        <form className="home-auth-form flex">
          <div className="form-changer flex">
            New at Notetaker?
            <Link to="signup" title="Register">
              Sign Up
            </Link>
          </div>

          <div className="message-box flex">
            {activationLink && (
              <div className="send-link-again">
                Haven't received the link?
                <span onClick={() => sendLinkAgain()}>Resend it</span>
              </div>
            )}
          </div>

          <div className="auth-form-input">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="jane_doe@host.com"
              maxLength={40}
              onInput={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-input">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              className="form-input-password"
              placeholder="< 30 characters"
              maxLength={30}
              onInput={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-reset-password">
            <span
              className="forgot-password"
              title="Reset Password"
              onClick={() => setDisplayRecover(true)}
            >
              Forgot Password ?
            </span>
          </div>
          <div className="auth-form-btn">
            <button
              type="button"
              className="btn home-content-btn"
              title="Sign In"
              onClick={() => {
                login();
                setLoading(true);
              }}
              disabled={loading}
            >
              <span
                className={
                  loading
                    ? "home-content-btn__loading"
                    : "home-content-btn__text"
                }
              ></span>
            </button>
          </div>
        </form>
      </div>

      {displayRecover && (
        <PasswordRecovery setDisplayRecover={setDisplayRecover} />
      )}

      <ToastContainer />
    </section>
  );
};

export default SignIn;
