import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { axiosPrivate } from "../../services/axios/Axios";
import ContentViewMenu from "../../components/ContentViewMenu";
import ConfirmDialog from "../../components/ConfirmDialog";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Tasks = () => {
  /**
   * Update Board Title.
   * Retrieve all the tasks.
   * Create a new task.
   * Change task status: Complete/Incomplete.
   * Update task body.
   */

  const { boardId: boardId } = useParams();
  const API_URL = `/api/task/${boardId}`;
  const { state } = useLocation();
  const navigate = useNavigate();
  const tasksRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [dialog, setDialog] = useState({ showDialog: false });
  const [edit, setEdit] = useState(false);
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

  const scrollToBottom = () => {
    tasksRef.current.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const cleanUp = () => {
    /**
     * Clean Up Dialog
     */

    setDialog({ showDialog: false });
  };

  const updateBoardTitle = async (e) => {
    /**
     * Update Board Title
     */

    try {
      await axiosPrivate({
        method: "patch",
        url: "/api/board",
        data: {
          action: "title",
          board_id: boardId,
          title: e.target.value,
        },
      });
      toast.success("Board title successfully updated.", toastConfig);
    } catch (error) {
      toast.error(
        "Something went wrong! Verify your request and try again.",
        toastConfig
      );
    }
  };

  const updateStatus = async (taskId) => {
    /**
     * Update Task status: Mark as complete or incomplete.
     */

    try {
      await axiosPrivate({
        method: "patch",
        url: API_URL,
        data: {
          action: "status",
          task_id: taskId,
        },
      });
      cleanUp();
      tasks.map((task) => {
        if (task.task_id === taskId) {
          task.status = !task.status;
        }
      });
      toast.success("Task successfully updated.", toastConfig);
    } catch (error) {
      toast.error(
        "Something went wrong when trying to update the status of your task.",
        toastConfig
      );
    }
  };

  const updateTask = async (e, taskId) => {
    /**
     * Update task body.
     * It cannot be empty.
     */

    try {
      await axiosPrivate({
        method: "patch",
        url: API_URL,
        data: {
          action: "body",
          task_id: taskId,
          body: e.target.value,
        },
      });
      cleanUp();
      toast.success("Successfully updated", toastConfig);
    } catch (error) {
      toast.error(
        "Something went wrong! Verify your request and try again.",
        toastConfig
      );
    }
  };

  const deleteTask = async () => {
    /**
     * Delete a task and update state
     */

    try {
      await axiosPrivate({
        method: "delete",
        url: API_URL,
        data: {
          task_id: dialog["id"],
        },
      });
      const tk = tasks.filter((tk) => tk.task_id !== dialog["id"]);
      setTasks(tk);
      cleanUp();
      toast.success("Task successfully deleted.", toastConfig);
    } catch (error) {
      toast.error(
        "Something went wrong when trying to delete your task.",
        toastConfig
      );
    }
  };

  const addNewTask = async (e) => {
    /**
     * Add a new task and update state
     */

    try {
      const response = await axiosPrivate({
        method: "post",
        url: API_URL,
        data: {
          body: e.target.value,
        },
      });
      e.target.value = "";
      setTasks(response.data);
      toast.success("Task successfully created.", toastConfig);
    } catch (error) {
      toast.error(
        "Something went wrong! Verify your request and try again.",
        toastConfig
      );
    }
  };

  const handleAddNewTask = (e) => {
    /**
     * When the user press ENTER verify the length and call the function.
     */

    if (e.keyCode === 13) {
      e.preventDefault();
      if (e.target.value) {
        addNewTask(e);
        e.target.value = "";
      }
    }
  };

  dialog["delete"] && deleteTask();

  useEffect(() => {
    const getTasks = async () => {
      /**
       * Get all the tasks from a specific user.
       */

      try {
        const response = await axiosPrivate.get(`/api/task/${boardId}`);
        setTasks(response.data);
      } catch (error) {
        toast.error(
          "Something went wrong when trying to catch your tasks.",
          toastConfig
        );
      }
    };

    getTasks();

    tasksRef.current && scrollToBottom();
  }, [tasksRef]);

  return (
    <>
      <div className="dark-base flex">
        <div className="tasks">
          <section className="tasks-header flex">
            <span className="tasks-header-icon">
              <i className="bi bi-stickies-fill"></i>
            </span>

            <span className="tasks-header-title">
              <input
                type="text"
                defaultValue={state["boardTitle"]}
                maxLength={18}
                title="Edit Board Title"
                onBlur={(e) => updateBoardTitle(e)}
              />
            </span>

            <span className="tasks-header-icon-back">
              <i
                className="bi bi-box-arrow-in-up-left"
                title="Back to Boards"
                onClick={() => navigate("/dashboard")}
              ></i>
            </span>

            <span className="tasks-header-edit">
              <nav title="Edit Tasks" onClick={() => setEdit(!edit)}>
                <span>
                  <i
                    className={
                      edit ? "bi bi-check2-square" : "bi bi-pencil-square"
                    }
                  ></i>
                </span>
                <span className="task-edit-description">
                  {edit ? "Save" : "Edit"}
                </span>
              </nav>
            </span>
          </section>

          <section ref={tasksRef} className="tasks-view-all">
            {tasks.map((value, idx) => (
              <div key={idx} className="task flex">
                <section
                  className={
                    value.status ? "task-status completed" : "task-status"
                  }
                >
                  {!edit && (
                    <input
                      type="checkbox"
                      title={`Mark as ${
                        value.status ? "incomplete" : "complete"
                      }`}
                      checked={value.status}
                      onChange={() => {
                        updateStatus(value.task_id);
                      }}
                    />
                  )}
                </section>

                <section
                  className={value.status ? "task-body completed" : "task-body"}
                >
                  {!edit && <span>{value.body}</span>}

                  {edit && (
                    <TextareaAutosize
                      maxLength={335}
                      defaultValue={value.body}
                      onBlur={(e) => {
                        e.target.value
                          ? (updateTask(e, value.task_id),
                            (value.body = e.target.value))
                          : (e.target.value = value.body);
                      }}
                    />
                  )}
                </section>

                {!edit && (
                  <ContentViewMenu
                    value={value}
                    type="task"
                    setDialog={setDialog}
                  />
                )}
              </div>
            ))}
          </section>

          <section className="tasks-add-new">
            {!edit && (
              <TextareaAutosize
                maxLength={335}
                placeholder="Add a new task"
                className="task-textarea"
                onKeyDown={(e) => handleAddNewTask(e)}
              />
            )}
          </section>
        </div>
      </div>
      {dialog["showDialog"] && (
        <ConfirmDialog dialog={dialog} setDialog={setDialog} />
      )}
    </>
  );
};

export default Tasks;
