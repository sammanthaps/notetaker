import { useState } from "react";

const AddNewSection = ({ dialog, setDialog }) => {
  /**
   * Ask the user the name of the Board or Book.
   * When the user click in the confirm button,
   * send a post request to the respective section.
   */

  const [title, setTitle] = useState();

  return (
    <div className="dark-base flex">
      <section className="alert-dialog-confirm">
        <span className="alert-dialog-symbol alert-dialog-bg-primary flex">
          <i className="bi bi-pencil-fill"></i>
        </span>

        <span className="alert-dialog-message flex">
          <div>
            <p>
              Enter the name of the
              <span className="text-primary">{dialog["section"]}</span>:
            </p>
            <p>
              <input
                type="text"
                maxLength={18}
                onBlur={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </p>
          </div>
        </span>

        <span className="alert-dialog-btns flex">
          <button
            className="btn-cancel"
            onClick={() => setDialog({ showDialog: false, showCreator: false })}
          >
            Cancel
          </button>
          <button
            className="btn-confirm"
            onClick={() =>
              setDialog({
                showDialog: false,
                showCreator: false,
                addNewSection: true,
                title: title,
              })
            }
          >
            Create
          </button>
        </span>
      </section>
    </div>
  );
};

export default AddNewSection;
