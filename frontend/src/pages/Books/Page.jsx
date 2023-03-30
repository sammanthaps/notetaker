import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosPrivate } from "../../services/axios/Axios";
import MDEditor from "@uiw/react-md-editor";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Page = () => {
  /**
   * Get a specific page.
   * Edit page body.
   */

  const { bookId: bookId, subjectId: subjectId, pageId: pageId } = useParams();
  const API_URL = `/api/book/${bookId}/subject/${subjectId}/page/${pageId}`;
  const [page, setPage] = useState("");
  const [edit, setEdit] = useState(false);
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

  const updatePage = async (e) => {
    /**
     * Update the page body.
     */

    setPage(e.target.value);

    try {
      await axiosPrivate({
        method: "patch",
        url: API_URL,
        data: {
          body: e.target.value,
        },
      });
      toast.success("Page updated successfully!", toastConfig);
    } catch (error) {
      toast.error(
        "Something went wrong when trying to update your page. Verify your request and try again.",
        toastConfig
      );
    }
  };

  useEffect(() => {
    const getPage = async () => {
      /**
       * Get a specific page from a specific user.
       */

      try {
        const response = await axiosPrivate.get(API_URL);
        setPage(response.data);
      } catch (error) {
        toast.error(
          "Something went wrong when trying to retrieve your pages. Verify your request and try again.",
          toastConfig
        );
      }
    };

    getPage();
  }, [pageId]);

  return (
    <div className="page-view">
      <div className="page-view-menu">
        <nav className="flex">
          <span className="page-view-back-button">
            <i
              className="bi bi-box-arrow-in-up-left"
              title="Previous Page"
              onClick={() => navigate(-1)}
            ></i>
          </span>

          <span
            className="page-view-edit-button"
            title="Edit Page"
            onClick={() => setEdit(!edit)}
          >
            <i className="bi bi-pencil-square"></i>
            {edit ? "Save" : "Edit"}
          </span>
        </nav>
      </div>

      <div className="page-view-body">
        {!edit && <MDEditor.Markdown source={page} />}
        {edit && (
          <textarea
            className="page-view-body-edit"
            defaultValue={page}
            onBlur={(e) => updatePage(e)}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
