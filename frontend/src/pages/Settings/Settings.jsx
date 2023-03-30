import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import ConfirmDialog from "../../components/ConfirmDialog";

const Settings = () => {
  const API_URL = "/api/profile";
  const navigate = useNavigate();

  const {
    user,
    setUser,
    setAccessToken,
    setRefreshToken,
    setCSRFToken,
    setLoading,
  } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [dialog, setDialog] = useState({
    showDialog: false,
    showCreator: false,
  });

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const toastConfig = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  };

  const updateCredentials = async () => {
    try {
      const response = await axiosPrivate({
        method: "put",
        url: API_URL,
        data: {
          first_name: first ? first : user.first_name,
          last_name: last ? last : user.last_name,
          username: username ? username : user.username,
          email: email ? email : user.email,
        },
      });
      toast.success("Credentials updated successfully!", toastConfig);
      let firstName = response.data.first_name;
      let lastName = response.data.last_name;
      setUser({
        name: `${firstName} ${lastName.slice(0, 1)}.`,
        avatar: response.data.avatar,
        username: response.data.username,
        email: response.data.email,
        first_name: firstName,
        last_name: lastName,
      });
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response?.data?.error, toastConfig);
      }
    }
  };

  const changePassword = async () => {
    try {
      await axiosPrivate({
        method: "post",
        url: API_URL,
        data: {
          current: currentPassword,
          password: password,
          confirm: confirm,
        },
      });
      toast.success("Password changed successfully!", toastConfig);
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(error.response?.data?.error, toastConfig);
      }
    }
  };

  const handleAvatarChange = async (e) => {
    let file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", (e) => {
      setUser({ ...user, avatar: e.target.result });
    });
    reader.readAsDataURL(file);

    try {
      await axiosPrivate({
        method: "patch",
        url: API_URL,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: {
          avatar: file,
        },
      });
      toast.success("Avatar updated successfully!", toastConfig);
    } catch (error) {
      if (error?.response?.data?.error) {
        toast.error(error?.response?.data?.error, toastConfig);
      }
    }
  };
  const deleteUser = async () => {
    try {
      await axiosPrivate({
        method: "delete",
        url: API_URL,
        data: {
          password: dialog["password"],
        },
      });
      navigate("/");
      setAccessToken(null);
      setRefreshToken(null);
      setCSRFToken(null);
      setLoading(true);
    } catch (error) {
      if (error?.response?.data?.error) {
        toast.error(error?.response?.data?.error, toastConfig);
      }
    }
  };

  if (dialog["delete"]) {
    deleteUser();
    setDialog({
      showDialog: false,
      showCreator: false,
    });
  }

  return (
    <>
      <div className="settings-header flex">
        <i className="bi bi-gear-fill"></i>Settings
      </div>
      <div className="settings-wrapper flex">
        <div className="settings-profile">
          <section className="profile-avatar flex">
            <figure>
              <img src={user && user.avatar} alt="" />
              <label title="Change Profile Picture" htmlFor="userAvatar">
                <i className="bi bi-pencil-square"></i>
              </label>
              <input
                type="file"
                id="userAvatar"
                onChange={(e) => handleAvatarChange(e)}
              />
            </figure>
          </section>

          <section className="profile-last-login">
            Last Login: Jan 17, 1997
          </section>

          <form className="profile-form">
            <div className="flex">
              <input
                name="first"
                id="first"
                placeholder="First Name"
                defaultValue={user && user.first_name}
                onInput={(e) => setFirst(e.target.value)}
                maxLength={20}
              />
              <input
                name="last"
                id="last"
                placeholder="Last Name"
                defaultValue={user && user.last_name}
                onInput={(e) => setLast(e.target.value)}
                maxLength={20}
              />
            </div>

            <div>
              <input
                name="username"
                id="username"
                placeholder="Username"
                defaultValue={user && user.username}
                onInput={(e) => setUsername(e.target.value)}
                maxLength={40}
              />
            </div>

            <div>
              <input
                name="email"
                id="email"
                placeholder="Email"
                defaultValue={user && user.email}
                onInput={(e) => setEmail(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="settings-btn flex">
              <button type="button" onClick={() => updateCredentials()}>
                Update Credentials
              </button>
            </div>
          </form>
        </div>

        <div className="settings-security flex">
          <section className="security-credentials">
            <div className="security-header">Change password</div>

            <div className="security-form">
              <form>
                <div>
                  <input
                    type="password"
                    name="current"
                    id="current"
                    placeholder="Current Password"
                    onInput={(e) => setCurrentPassword(e.target.value)}
                    maxLength={30}
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="New Password"
                    onInput={(e) => setPassword(e.target.value)}
                    maxLength={30}
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="confirm"
                    id="confirm"
                    placeholder="Confirm New Password"
                    onInput={(e) => setConfirm(e.target.value)}
                    maxLength={30}
                    required
                  />
                </div>

                <div className="settings-btn flex">
                  <button type="button" onClick={() => changePassword()}>
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="security-danger-zone">
            <div className="security-header danger-zone-header">
              Danger Zone
            </div>

            <div>
              <div className="danger-zone-description">
                <div className="desc-header">Delete Your Account</div>
                <div className="desc-alert">
                  Once you delete your account, there is no going back. Please
                  be careful.
                </div>
              </div>

              <div className="settings-btn danger-zone-btn flex">
                <button
                  onClick={() =>
                    setDialog({
                      showDialog: true,
                      showCreator: false,
                      type: "account",
                    })
                  }
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Outlet />
      {dialog["showDialog"] && (
        <ConfirmDialog dialog={dialog} setDialog={setDialog} />
      )}
      <ToastContainer />
    </>
  );
};

export default Settings;
