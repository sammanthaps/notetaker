import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Root = () => {
  const { accessToken } = useAuth();

  return (
    <main className="wrapper flex">
      <section id="home" className="container">
        <div className="home-content">
          <h1 className="home-content-header">
            Welcome to <span>Notetaker</span>
          </h1>

          <p className="home-content-description">
            A tool to keep your tasks and notes together.
          </p>

          <p className="home-content-link">
            {accessToken ? (
              <a href="/dashboard">
                <button className="btn home-content-btn">
                  Go to your dashboard
                </button>
              </a>
            ) : (
              <a href="#auth">
                <button className="btn home-content-btn">Get Started</button>
              </a>
            )}
          </p>
        </div>
      </section>

      {!accessToken && (
        <section id="auth" className="container">
          <Outlet />
        </section>
      )}
    </main>
  );
};

export default Root;
