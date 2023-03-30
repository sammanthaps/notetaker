const ContentViewMenu = ({ value, type, setDialog }) => {
  /**
   * Display the trash menu in tasks, categories and pages.
   */

  let item;
  let itemId;
  let itemClass;

  if (type === "task") {
    item = `${value.body?.slice(0, 7)}...`;
    itemId = value.task_id;
    itemClass = "tasks-menu";
  } else if (type === "subject") {
    item = value.title;
    itemId = value.subject_id;
    itemClass = "subjects-menu";
  } else if (type === "page") {
    item = value.body;
    itemId = value.page_id;
    itemClass = "pages-menu";
  }

  return (
    <section className={itemClass}>
      <i
        className="bi bi-trash2-fill"
        title={`Delete ${type}`}
        onClick={() =>
          setDialog({
            showDialog: true,
            item: item,
            type: type,
            id: itemId,
          })
        }
      ></i>
    </section>
  );
};

export default ContentViewMenu;
