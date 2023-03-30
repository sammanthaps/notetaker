const CardViewMenu = ({ value, type, setDialog }) => {
  /**
   * Display a hover menu for each item.
   * The user can delete, pin or unpin boards and books.
   */

  return (
    <nav className="card-view-menu">
      <span>
        <i className="bi bi-three-dots"></i>
      </span>
      <ul>
        <li
          onClick={() =>
            setDialog({
              showDialog: true,
              showCreator: false,
              item: value.title,
              type: type,
              id: type === "board" ? value.board_id : value.book_id,
            })
          }
        >
          Delete
        </li>
        <li
          onClick={() =>
            setDialog({
              showDialog: false,
              showCreator: false,
              status: true,
              id: type === "board" ? value.board_id : value.book_id,
            })
          }
        >
          {value.pinned ? "Unpin" : "Pin"}
        </li>
      </ul>
    </nav>
  );
};

export default CardViewMenu;
