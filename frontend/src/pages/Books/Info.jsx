const Info = () => {
  /**
   * Display this page as default, when there's no active link.
   */

  const getSectionClass = () => {
    let ref = window.location.pathname;
    let pathnameList = ref.split("/");
    let lastIndex = pathnameList.length - 1;

    if (pathnameList[lastIndex] == "categories") {
      return "categories-info-view flex";
    } else {
      return "pages-info-view flex";
    }
  };

  return (
    <div className={getSectionClass()}>
      <i className="bi bi-book-half info-icon"></i>
      <p className="text-default w-600 text-primary">
        Click on a item in the menu, and it will appear here.
      </p>
    </div>
  );
};

export default Info;
