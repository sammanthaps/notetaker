import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../services/axios/Axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

const ResetPassword = () => {
  const { authToken: authToken } = useParams();
  const [password, setPassword] = useState();
  const [confirm, setConfirm] = useState();
  const navigate = useNavigate();

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

  const resetPassword = async () => {
    try {
      const response = await axiosInstance({
        method: "post",
        url: `/api/account/${authToken}`,
        data: {
          password: password,
          confirm: confirm,
        },
      });
      toast.success(response.data.success, toastConfig);
      setTimeout(() => {
        navigate("/");
      }, 5000);
    } catch (error) {
      if (error?.response?.data?.error) {
        toast.error(error?.response?.data?.error, toastConfig);
      }
    }
  };

  return (
    <main className="account account-pass flex">
      <div className="account-container flex">
        <section className="account-header flex">
          <nav className="account-header-logo">
            <i className="bi bi-sticky-fill"></i>
            Notetaker
          </nav>
        </section>

        <section className="account-body flex">
          <div className="account-body-description">Reset your password:</div>
          <form>
            <div className="new-password-form">
              <div className="pass-input">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="< 30 characters"
                  maxLength="30"
                  onInput={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pass-input">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="< 30 characters"
                  maxLength="30"
                  onInput={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="account-body-btn">
              <button
                type="button"
                className="btn home-content-btn"
                onClick={() => resetPassword()}
              >
                Reset Password
              </button>
            </div>
          </form>
        </section>
      </div>
      <ToastContainer />
    </main>
  );
};

export default ResetPassword;
