import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useEffect } from "react";

const SideBar = () => {
  /**
   * This is the main Sidebar and Topbar(for smaller devices).
   * It will be displayed in all the pages.
   */

  const { user, setUser, setAccessToken, setRefreshToken, setCSRFToken } =
    useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axiosPrivate.get("/api/profile");

        let first = response.data.first_name;
        let last = response.data.last_name;

        setUser({
          name: `${first} ${last.slice(0, 1)}.`,
          avatar: API_URL + response.data.avatar,
          username: response.data.username,
          email: response.data.email,
          first_name: first,
          last_name: last,
        });
      } catch (error) {
        console.log("error", error?.code);
      }
    };

    getUser();
  }, []);

  const getActiveClassSideBar = () => {
    /**
     * Change Dashboard class name when active.
     */

    let ref = window.location.pathname;
    if (ref === "/dashboard/settings") {
      return "sidebar-item-link";
    } else {
      return "sidebar-item-link active";
    }
  };

  const getActiveClassTopBar = () => {
    /**
     * Change Dashboard class name when active.
     */

    let ref = window.location.pathname;
    if (ref === "/dashboard/settings") {
      return "topbar-item-link";
    } else {
      return "topbar-item-link active";
    }
  };

  const logout = async () => {
    try {
      await axiosPrivate.post("/api/logout");
      navigate("/");
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setCSRFToken(null);
    } catch (error) {
      if (error?.code) {
        console.log("error", error.code);
      }
    }
  };

  return (
    <>
      <nav className="sidebar">
        <section className="sidebar-logo">
          <i className="bi bi-sticky-fill"></i>
          Notetaker
        </section>

        <section className="sidebar-nav d-t">
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <NavLink
                to="/dashboard"
                className={() => getActiveClassSideBar()}
              >
                <span>
                  <i className="bi bi-grid-fill"></i>
                </span>
                Dashboard
              </NavLink>
            </li>

            <li className="sidebar-item">
              <NavLink to="/dashboard/settings" className="sidebar-item-link">
                <span>
                  <i className="bi bi-gear-fill"></i>
                </span>
                Settings
              </NavLink>
            </li>
          </ul>
        </section>

        <section className="badge flex">
          <span className="badge-pic">
            <img src={user && user.avatar} alt="" />
          </span>

          <span className="badge-body flex">
            <p className="badge-body-user">
              {user ? user.name : "Unknown Guest"}
            </p>
          </span>

          <span className="badge-menu">
            <i
              className="bi bi-box-arrow-right"
              title="Log Out"
              onClick={() => logout()}
            ></i>
          </span>
        </section>
      </nav>

      <nav className="topbar">
        <section className="topbar-logo">
          <i className="bi bi-sticky-fill"></i>
          Notetaker
        </section>

        <section className="topbar-nav">
          <ul className="topbar-list">
            <li className="topbar-item">
              <NavLink
                to="/dashboard"
                title="Dashboard"
                className={() => getActiveClassTopBar()}
              >
                <span>
                  <i className="bi bi-grid-fill"></i>
                </span>
              </NavLink>
            </li>

            <li className="topbar-item">
              <NavLink
                to="/dashboard/settings"
                title="Settings"
                className="topbar-item-link"
              >
                <span>
                  <i className="bi bi-gear-fill"></i>
                </span>
              </NavLink>
            </li>

            <li className="topbar-item">
              <span className="topbar-logout topbar-item-link">
                <i
                  className="bi bi-box-arrow-right"
                  title="Log Out"
                  onClick={() => logout()}
                ></i>
              </span>
            </li>
          </ul>
        </section>

        <section className="topbar-badge-pic flex">
          <img
            src={user && user.avatar}
            alt=""
            title={`@${user && user.username}`}
          />
        </section>
      </nav>
    </>
  );
};

export default SideBar;
