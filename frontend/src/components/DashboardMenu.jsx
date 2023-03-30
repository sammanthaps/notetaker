import { NavLink } from "react-router-dom";

const DashboardMenu = ({ section, setDialog }) => {
  /**
   * This is the dashboard menu.
   * It will be displayed in boards and books sections.
   */

  const getActiveClass = () => {
    /**
     * Change Nav Link class name when active.
     */
    let ref = window.location.pathname;
    if (ref === "/dashboard") {
      return "sliding-navlink active";
    } else {
      return "sliding-navlink";
    }
  };

  return (
    <>
      <div className="sliding-nav-header-sm">
        <i className="bi bi-kanban-fill"></i>Dashboard
      </div>
      <div className="sliding-nav flex">
        <div className="sliding-nav-header">
          <i className="bi bi-kanban-fill"></i>Dashboard
        </div>

        <nav className="sliding-nav-links">
          <NavLink to="/dashboard" className={() => getActiveClass()}>
            <span className="icon">
              <i className="bi bi-stack"></i>
            </span>
            Boards
          </NavLink>

          <NavLink to="/dashboard/books" className="sliding-navlink">
            <span className="icon">
              <i className="bi bi-collection-fill"></i>
            </span>
            Books
          </NavLink>
        </nav>

        <div className="sliding-nav-add">
          <i
            className="bi bi-plus-circle-fill"
            title={`Add a new ${section}`}
            onClick={() =>
              setDialog({
                showDialog: false,
                showCreator: true,
                section: section,
              })
            }
          ></i>
        </div>
      </div>
    </>
  );
};

export default DashboardMenu;
