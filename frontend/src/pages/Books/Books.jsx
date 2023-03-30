import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DashboardMenu from "../../components/DashboardMenu";
import CardViewMenu from "../../components/CardViewMenu";
import ConfirmDialog from "../../components/ConfirmDialog";
import AddNewSection from "../../components/AddNewSection";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Books = () => {
  /**
   * Retrieve all the books.
   * Create a new book.
   * Delete or Pin/Unpin a book.
   */

  const API_URL = "/api/books";
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [dialog, setDialog] = useState({
    showDialog: false,
    showCreator: false,
  });
  const messageError = ({ action }) => {
    return `Something went wrong when trying to ${action} your book. Verify your request and try again.`;
  };
  const messageSuccess = ({ action }) => {
    return `Book ${action} successfully!`;
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
     * Pin/Unpin Books
     */

    try {
      const response = await axiosPrivate({
        method: "patch",
        url: API_URL,
        data: {
          action: "pin",
          book_id: dialog["id"],
        },
      });
      setBooks(response.data);
      toast.success(messageSuccess({ action: "updated" }), toastConfig);
    } catch (error) {
      toast.error(messageError({ action: "update" }), toastConfig);
    }
  };

  const deleteBook = async () => {
    /**
     * Delete a book and update list.
     */

    try {
      await axiosPrivate({
        method: "delete",
        url: API_URL,
        data: {
          book_id: dialog["id"],
        },
      });
      const bk = books.filter((bk) => bk.book_id !== dialog["id"]);
      setBooks(bk);
      toast.success(messageSuccess({ action: "deleted" }), toastConfig);
    } catch (error) {
      toast.error(messageError({ action: "delete" }), toastConfig);
    }
  };

  const newBook = async () => {
    /**
     * Create a new Book
     */

    try {
      const response = await axiosPrivate({
        method: "post",
        url: API_URL,
        data: {
          title: dialog["title"],
        },
      });
      navigate(`/dashboard/books/${response.data}/categories`, {
        state: { bookTitle: dialog["title"] },
      });
    } catch (error) {
      toast.error(messageError({ action: "create" }), toastConfig);
    }
  };

  const cleanUp = () => {
    /**
     * Clean Up dialog actions.
     */

    setDialog({
      showDialog: false,
      showCreator: false,
    });
  };

  if (dialog["addNewSection"]) {
    newBook();
    cleanUp();
  } else if (dialog["delete"]) {
    deleteBook();
    cleanUp();
  } else if (dialog["status"]) {
    updateStatus();
    cleanUp();
  }

  useEffect(() => {
    const getBooks = async () => {
      /**
       * Retrieve all books from specific user.
       */

      try {
        const response = await axiosPrivate({
          method: "get",
          url: API_URL,
        });
        setBooks(response.data);
      } catch (error) {
        toast.error(messageError({ action: "retrieve" }), toastConfig);
      }
    };

    getBooks();
  }, [location]);

  return (
    <>
      <DashboardMenu section="Book" setDialog={setDialog} />
      <section className="cards flex">
        {books.map((book, idx) => (
          <article key={idx} className="card card-md">
            <section className="card-header-md flex">
              <span className="pinned">
                {book.pinned && <i className="bi bi-p-circle-fill"></i>}
              </span>
              <CardViewMenu value={book} type="book" setDialog={setDialog} />
            </section>

            <NavLink
              to={`/dashboard/books/${book.book_id}/categories`}
              state={{ bookTitle: book.title }}
            >
              <section className="card-body-md flex">
                <h3>{book.title}</h3>
              </section>

              <section className="card-footer-md flex">
                <span className="flex">{book.updated_on}</span>
              </section>
            </NavLink>
          </article>
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

export default Books;
