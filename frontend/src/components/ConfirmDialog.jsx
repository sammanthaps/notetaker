import { useState } from "react";

const ConfirmDialog = ({ dialog, setDialog }) => {
  /**
   * When trying to delete an item, a confirmation dialog should appear.
   * If user click in confirm, the item will be deleted.
   * Otherwise, nothing will be done.
   */

  const [password, setPassword] = useState();

  return (
    <div className="dark-base flex">
      <section
        className={
          dialog["type"] === "account"
            ? "alert-dialog-confirm-account"
            : "alert-dialog-confirm"
        }
      >
        {dialog["type"] === "account" ? (
          <span className="alert-dialog-symbol alert-dialog-bg-danger-black flex">
            <i className="bi bi-exclamation-diamond-fill"></i>
          </span>
        ) : (
          <span className="alert-dialog-symbol alert-dialog-bg-warning flex">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </span>
        )}

        {dialog["type"] === "account" ? (
          <span className="alert-dialog-message-account">
            <p>
              If you are sure you want to delete
              <span>Your Account</span>, enter your password below:
            </p>
            <p>
              <input
                type="password"
                name="password"
                id="password"
                maxLength={30}
                onInput={(e) => setPassword(e.target.value)}
                required
              />
            </p>
          </span>
        ) : (
          <span className="alert-dialog-message flex">
            <p>
              Are you sure you want to delete the
              <span>{dialog["item"]}</span>
              {dialog["type"]}?
            </p>
          </span>
        )}

        <span className="alert-dialog-btns flex">
          <button
            className="btn-cancel"
            onClick={() =>
              setDialog({
                showDialog: false,
                showCreator: false,
              })
            }
          >
            Cancel
          </button>
          {dialog["type"] === "account" ? (
            <button
              className="btn-confirm"
              onClick={() =>
                setDialog({
                  showDialog: false,
                  showCreator: false,
                  delete: true,
                  password: password,
                })
              }
            >
              Yes, I'm Sure
            </button>
          ) : (
            <button
              className="btn-confirm"
              onClick={() =>
                setDialog({
                  showDialog: false,
                  showCreator: false,
                  delete: true,
                  id: dialog["id"],
                })
              }
            >
              Confirm
            </button>
          )}
        </span>
      </section>
    </div>
  );
};

export default ConfirmDialog;
