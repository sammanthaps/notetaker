import { useEffect, useState } from "react";
import { axiosPrivate } from "../../services/axios/Axios";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import ContentViewMenu from "../../components/ContentViewMenu";
import ConfirmDialog from "../../components/ConfirmDialog";
import AddNewSection from "../../components/AddNewSection";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Categories = () => {
  /**
   * Edit book title.
   * Retrieve all of the subjects.
   * Create a new subject.
   * Delete a subject.
   */

  const bookId = useParams().bookId;
  const API_URL = `/api/book/${bookId}`;
  const [categories, setCategories] = useState([]);
  const [dialog, setDialog] = useState({ showDialog: false });
  const { state } = useLocation();
  const navigate = useNavigate();
  const messageError = ({ action, section }) => {
    return `Something went wrong when trying to ${action} your ${section}. Verify your request and try again.`;
  };
  const messageSuccess = ({ action }) => {
    return `Subject ${action} successfully!`;
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

  const updateBookTitle = async (e) => {
    /**
     * Change book title.
     */

    try {
      await axiosPrivate({
        method: "patch",
        url: "/api/books",
        data: {
          book_id: bookId,
          action: "title",
          title: e.target.value,
        },
      });
      toast.success("Board title updated successfully!", toastConfig);
    } catch (error) {
      toast.error(
        messageError({ action: "update", section: "board title" }),
        toastConfig
      );
    }
  };

  const deleteCategory = async () => {
    /**
     * Delete a category.
     */

    try {
      await axiosPrivate({
        method: "delete",
        url: API_URL,
        data: {
          category_id: dialog["id"],
        },
      });
      const cg = categories.filter((cg) => cg.subject_id !== dialog["id"]);
      setCategories(cg);
      navigate(`/dashboard/books/${bookId}/categories`, {
        state: { bookTitle: state["bookTitle"] },
      });
      toast.success(messageSuccess({ action: "deleted" }), toastConfig);
    } catch (error) {
      toast.error(
        messageError({ action: "delete", section: "subject" }),
        toastConfig
      );
    }
  };

  const addNewCategory = async () => {
    /**
     * Add new category.
     */

    try {
      const response = await axiosPrivate({
        method: "post",
        url: API_URL,
        data: {
          title: dialog["title"],
        },
      });
      setCategories(response.data.subjects);
      navigate(
        `/dashboard/books/${bookId}/categories/${response.data.new_subject}/pages`,
        {
          state: { bookTitle: state["bookTitle"] },
        }
      );
      toast.success(messageSuccess({ action: "created" }), toastConfig);
    } catch (error) {
      toast.error(
        messageError({ action: "create", section: "subject" }),
        toastConfig
      );
    }
  };

  const cleanUp = () => {
    /**
     * Clean Up dialog actions.
     */

    setDialog({ showDialog: false, showCreator: false });
  };

  if (dialog["delete"]) {
    deleteCategory();
    cleanUp();
  } else if (dialog["addNewSection"]) {
    addNewCategory();
    cleanUp();
  }

  useEffect(() => {
    const getCategories = async () => {
      /**
       * Get all subjects from specific user.
       */

      try {
        const response = await axiosPrivate.get(API_URL);
        setCategories(response.data);
      } catch (error) {
        toast.error(
          messageError({ action: "retrieve", section: "subjects" }),
          toastConfig
        );
      }
    };

    getCategories();
  }, []);

  return (
    <>
      <div className="dark-base flex">
        <div className="book-view flex">
          <div className="book-view-menu">
            <section className="book-view-menu-header flex">
              <span className="book-view-menu-header-icon">
                <i
                  className="bi bi-bookmark-fill"
                  title="Back to Books"
                  onClick={() => navigate("/dashboard/books")}
                ></i>
              </span>
              <input
                type="text"
                defaultValue={state["bookTitle"]}
                maxLength={18}
                title="Edit Book Title"
                onBlur={(e) => updateBookTitle(e)}
              />
              <span className="book-view-menu-header-icon-back">
                <i
                  className="bi bi-box-arrow-in-up-left"
                  title="Back to Books"
                  onClick={() => navigate("/dashboard/books")}
                ></i>
              </span>
            </section>

            <section className="book-view-menu-add">
              <button
                className="w-600"
                title="Add a new subject"
                onClick={() =>
                  setDialog({
                    showDialog: false,
                    showCreator: true,
                    section: "Subject",
                  })
                }
              >
                New Subject
              </button>
            </section>

            <section className="menu-nav">
              <span className="menu-nav-title">Subjects</span>

              <span className="menu-nav-links">
                {categories.map((value, idx) => (
                  <NavLink
                    to={`${value.subject_id}/pages`}
                    className="subject-link flex"
                    state={{ bookTitle: state["bookTitle"] }}
                    key={idx}
                  >
                    <section className="subject-body w-600">
                      {value.title}
                    </section>

                    <ContentViewMenu
                      value={value}
                      type="subject"
                      setDialog={setDialog}
                    />
                  </NavLink>
                ))}
              </span>
            </section>
          </div>

          <div className="book-view-content flex">
            <Outlet />
          </div>
        </div>
      </div>
      {dialog["showDialog"] && (
        <ConfirmDialog dialog={dialog} setDialog={setDialog} />
      )}

      {dialog["showCreator"] && (
        <AddNewSection dialog={dialog} setDialog={setDialog} />
      )}
    </>
  );
};

export default Categories;
