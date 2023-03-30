import { useState } from "react";
import axiosInstance from "../services/axios/Axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PasswordRecovery = ({ setDisplayRecover }) => {
  const [email, setEmail] = useState();
  const [loading, setLoading] = useState(false);
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

  const forgotPassword = async () => {
    try {
      const response = await axiosInstance({
        method: "post",
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
    setLoading(false);
  };

  return (
    <div className="dark-base flex">
      <div className="account-email-container flex">
        <section className="account-header flex">
          <nav className="account-header-logo">
            <i className="bi bi-sticky-fill"></i>
            Notetaker
            <span>
              <i
                className="bi bi-box-arrow-in-up-left"
                title="Go to previous page"
                onClick={() => setDisplayRecover(false)}
              ></i>
            </span>
          </nav>
        </section>

        <section className="account-body flex">
          <div className="account-email__recover">
            <span>Forgot your password? Don't worry!</span>
            We send you a recover link.
          </div>
          <form className="account-email__form flex">
            <div className="account-email__input">
              <input
                type="email"
                placeholder="jane_doe@host.com"
                maxLength="50"
                onInput={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </form>
          <div className="account-email__button">
            <button
              className="btn home-content-btn"
              onClick={() => {
                setLoading(true);
                forgotPassword();
              }}
            >
              <span
                className={
                  loading
                    ? "home-content-btn__loading__link"
                    : "home-content-btn__text__link"
                }
              ></span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PasswordRecovery;
