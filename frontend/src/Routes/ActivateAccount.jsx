import axiosInstance from "../services/axios/Axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ActivateAccount = () => {
  const { authToken: authToken } = useParams();
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

  const activateAccount = async (e) => {
    e.preventDefault();

    let OTPList =
      e.target.code1.value +
      e.target.code2.value +
      e.target.code3.value +
      e.target.code4.value;

    try {
      const response = await axiosInstance({
        method: "put",
        url: `api/account/${authToken}`,
        data: {
          otp_list: OTPList,
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
    <main className="account flex">
      <div className="account-container flex">
        <section className="account-header flex">
          <nav className="account-header-logo">
            <i className="bi bi-sticky-fill"></i>
            Notetaker
          </nav>
        </section>

        <section className="account-body flex">
          <p className="account-body-description">Enter your code:</p>
          <form onSubmit={(e) => activateAccount(e)}>
            <div className="otp-form">
              <input
                name="code1"
                id="code1"
                type="number"
                min="1"
                max="99"
                required
              />
              <input
                name="code2"
                id="code2"
                type="number"
                min="1"
                max="99"
                required
              />
              <input
                name="code3"
                id="code3"
                type="number"
                min="1"
                max="99"
                required
              />
              <input
                name="code4"
                id="code4"
                type="number"
                min="1"
                max="99"
                required
              />
            </div>
            <p className="account-body-btn">
              <input
                type="submit"
                className="btn home-content-btn"
                value="Activate Account"
              />
            </p>
          </form>
        </section>
      </div>

      <ToastContainer />
    </main>
  );
};

export default ActivateAccount;
