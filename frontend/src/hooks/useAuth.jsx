import { useContext } from "react";
import Context from "../services/auth/Context";

const useAuth = () => {
  /**
   * This hook will return all the context variables.
   */

  return useContext(Context);
};

export default useAuth;
