import "../assets/style/Loading.css";

const Loading = () => {
  /**
   * When loading the pages, display a loader, letting the users know
   * that their's workspaces are being prepared.
   */

  return (
    <div className="loading-box box-absolute box-flex">
      <div className="loading-content box-absolute box-flex">
        <h1 className="title">Preparing your Workspace</h1>
        <div className="rainbow-marker-loader"></div>
      </div>
    </div>
  );
};

export default Loading;
