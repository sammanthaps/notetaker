import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DashboardMenu from "../../components/DashboardMenu";
import CardViewMenu from "../../components/CardViewMenu";
import ConfirmDialog from "../../components/ConfirmDialog";
import AddNewSection from "../../components/AddNewSection";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Boards = () => {
  /**
   * Retrieve all the boards.
   * Create a new board.
   * Delete or Pin/Unpin a board.
   */

  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const API_URL = "/api/board";
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [dialog, setDialog] = useState({
    showDialog: false,
    showCreator: false,
  });
  const messageError = ({ action }) => {
    return `Something went wrong when trying to ${action} your board. \n Verify your request and try again.`;
  };
  const messageSuccess = ({ action }) => {
    return `Board ${action} successfully!`;
  };
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

  const updateStatus = async () => {
    /**
     * Pin/Unpin a Board
     */

    try {
      const response = await axiosPrivate({
        method: "patch",
        url: API_URL,
        data: {
          action: "pin",
          board_id: dialog["id"],
        },
      });
      setBoards(response.data);
      toast.success(messageSuccess({ action: "updated" }), toastConfig);
    } catch (err) {
      toast.error(messageError({ action: "update" }), toastConfig);
    }
  };

  const deleteBoard = async () => {
    /**
     * Delete a Board
     */

    try {
      await axiosPrivate({
        method: "delete",
        url: API_URL,
        data: {
          board_id: dialog["id"],
        },
      });
      const bd = boards.filter((bd) => bd.board_id !== dialog["id"]);
      setBoards(bd);
      toast.success(messageSuccess({ action: "deleted" }), toastConfig);
    } catch (error) {
      toast.error(messageError({ action: "delete" }), toastConfig);
    }
  };

  const newBoard = async () => {
    /**
     * Create a Board
     */

    try {
      const response = await axiosPrivate({
        method: "post",
        url: API_URL,
        data: {
          title: dialog["title"],
        },
      });
      navigate(`/dashboard/boards/task/${response.data}`, {
        state: { boardTitle: dialog["title"] },
      });
    } catch (err) {
      toast.error(messageError({ action: "create" }), toastConfig);
    }
  };

  const cleanUp = () => {
    /**
     * Clean Up all the actions in the dialog.
     */

    setDialog({
      showDialog: false,
      showCreator: false,
    });
  };

  if (dialog["addNewSection"]) {
    newBoard();
    cleanUp();
  } else if (dialog["delete"]) {
    deleteBoard();
    cleanUp();
  } else if (dialog["status"]) {
    updateStatus();
    cleanUp();
  }

  useEffect(() => {
    const getBoards = async () => {
      /**
       * Get all the Boards from a specific user.
       */

      try {
        const response = await axiosPrivate({
          method: "get",
          url: API_URL,
        });
        setBoards(response.data);
      } catch (err) {
        toast.error(messageError({ action: "retrieve" }), toastConfig);
      }
    };
    getBoards();
  }, [location]);

  return (
    <>
      <DashboardMenu section="Board" setDialog={setDialog} />
      <section className="cards flex">
        {boards.map((board, idx) => (
          <div className="card card-sm" key={idx}>
            <section className="card-header-sm flex">
              <span className="pinned">
                {board.pinned && (
                  <i className="bi bi-p-circle-fill" title="Pinned"></i>
                )}
              </span>

              <CardViewMenu value={board} type="board" setDialog={setDialog} />
            </section>
            <NavLink
              to={`/dashboard/boards/task/${board.board_id}`}
              state={{ boardTitle: board.title }}
            >
              <section className="card-body-sm flex">
                <h3>{board.title}</h3>
              </section>

              <section className="card-footer-sm">
                <span className="flex">{board.updated_on}</span>
              </section>
            </NavLink>
          </div>
        ))}
      </section>
      {dialog["showDialog"] && (
        <ConfirmDialog dialog={dialog} setDialog={setDialog} />
      )}
      {dialog["showCreator"] && (
        <AddNewSection dialog={dialog} setDialog={setDialog} />
      )}
      <Outlet />
      <ToastContainer />
    </>
  );
};

export default Boards;
