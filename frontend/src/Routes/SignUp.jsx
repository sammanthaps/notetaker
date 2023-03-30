import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../services/axios/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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

  const register = async () => {
    try {
      const response = await axiosInstance({
        method: "post",
        url: "/api/register",
        data: {
          first_name: first,
          last_name: last,
          username: username,
          email: email,
          password: password,
          confirmation: confirm,
        },
      });
      toast.success(response.data.success, toastConfig);
      document.getElementById("auth-form").reset();
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response?.data?.error, toastConfig);
      }
    }

    setLoading(false);
  };

  return (
    <section className="home-auth-content flex">
      <div className="home-auth">
        <form
          className="home-auth-form home-auth-form-register flex"
          id="auth-form"
        >
          <div className="form-changer flex">
            Have an account ?
            <Link to="/" title="Login">
              Sign In
            </Link>
          </div>

          <div className="auth-form-input-name">
            <div className="auth-form-input">
              <label htmlFor="first">First Name</label>
              <input
                type="text"
                name="first"
                id="first"
                placeholder="Jane"
                maxLength={20}
                onInput={(e) => setFirst(e.target.value)}
                required
              />
            </div>

            <div className="auth-form-input">
              <label htmlFor="last">Last Name</label>
              <input
                type="text"
                name="last"
                id="last"
                placeholder="Doe"
                maxLength={20}
                onInput={(e) => setLast(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-form-input">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Jane_Doe"
              maxLength={40}
              onInput={(e) => setUsername(e.target.value)}
              required
            />
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
              className="password"
              placeholder="< 30 characters"
              maxLength={30}
              onInput={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-input">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              id="confirm"
              className="password"
              placeholder="< 30 characters"
              maxLength={30}
              onInput={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-btn">
            <button
              type="button"
              className="btn home-content-btn"
              title="Sign Up"
              onClick={() => {
                register();
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
      <ToastContainer />
    </section>
  );
};

export default SignUp;
