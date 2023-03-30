import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";

const Dashboard = () => {
  return (
    <main className="app">
      <div className="app-content container flex-row">
        <SideBar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
