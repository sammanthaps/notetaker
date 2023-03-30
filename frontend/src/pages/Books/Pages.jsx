import { useEffect, useState } from "react";
import {
  Outlet,
  useParams,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { axiosPrivate } from "../../services/axios/Axios";
import ContentViewMenu from "../../components/ContentViewMenu";
import ConfirmDialog from "../../components/ConfirmDialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Pages = () => {
  /**
   * Change book title.
   */

  const { bookId: bookId, subjectId: subjectId } = useParams();
  const { state } = useLocation();
  const API_URL = `/api/book/${bookId}/subject/${subjectId}`;
  const [pages, setPages] = useState([]);
  const [dialog, setDialog] = useState({ showDialog: false });
  const navigate = useNavigate();
  const messageError = ({ action, section }) => {
    return `Something went wrong when trying to ${action} your ${section}. Verify your request and try again.`;
  };
  const messageSuccess = ({ action }) => {
    return `Page ${action} successfully!`;
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

  const addNewPage = async () => {
    /**
     * Add a new page.
     */

    try {
      const response = await axiosPrivate.post(API_URL);
      setPages(response.data.pages);

      navigate(`${response.data.pageId}`, {
        state: { bookTitle: state["bookTitle"] },
      });
      toast.success(messageSuccess({ action: "created" }), toastConfig);
    } catch (error) {
      toast.error(
        messageError({ action: "create", section: "page" }),
        toastConfig
      );
    }
  };

  const deletePage = async () => {
    /**
     * Delete a page.
     */

    try {
      await axiosPrivate({
        method: "delete",
        url: API_URL,
        data: {
          page_id: dialog["id"],
        },
      });
      const pg = pages.filter((pg) => pg.page_id !== dialog["id"]);
      setPages(pg);
      navigate(`/dashboard/books/${bookId}/categories/${subjectId}/pages`, {
        state: { bookTitle: state["bookTitle"] },
      });
      toast.success(messageSuccess({ action: "deleted" }), toastConfig);
    } catch (error) {
      toast.error(
        messageError({ action: "delete", section: "page" }),
        toastConfig
      );
    }
  };

  if (dialog["delete"]) {
    deletePage();
    setDialog({ showDialog: false, showCreator: false });
  }

  useEffect(() => {
    const getPages = async () => {
      /**
       * Get all of the pages from a specific user.
       */

      try {
        const response = await axiosPrivate.get(API_URL);
        setPages(response.data);
      } catch (error) {
        toast.error(
          messageError({ action: "retrieve", section: "pages" }),
          toastConfig
        );
      }
    };

    getPages();
  }, [subjectId]);

  return (
    <>
      <div className="pages-view-all">
        <section className="book-view-menu-add">
          <button
            className="w-600"
            title="Add a new page"
            onClick={() => addNewPage()}
          >
            New Page
          </button>
        </section>
        <section className="menu-nav">
          <span className="menu-nav-title">Pages</span>
          <span className="menu-nav-links">
            {pages.map((value, idx) => (
              <NavLink
                to={`${value.page_id}`}
                className="subject-link flex"
                state={{ bookTitle: state["bookTitle"] }}
                key={idx}
              >
                <section className="subject-body w-600">
                  {idx + 1}: {value.body}
                </section>

                <ContentViewMenu
                  value={value}
                  type="page"
                  setDialog={setDialog}
                />
              </NavLink>
            ))}
          </span>
        </section>
      </div>
      <Outlet />

      {dialog["showDialog"] && (
        <ConfirmDialog dialog={dialog} setDialog={setDialog} />
      )}
    </>
  );
};

export default Pages;
