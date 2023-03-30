import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import Provider from "./services/auth/Provider";
import Protect from "./services/auth/Protect";

import Root from "./Routes/Root";
import SignIn from "./Routes/SignIn";
import SignUp from "./Routes/SignUp";
import ActivateAccount from "./Routes/ActivateAccount";
import ResetPassword from "./Routes/ResetPassword";

import Dashboard from "./pages/Dashboard";

import Boards from "./pages/Boards/Boards";
import Tasks from "./pages/Boards/Tasks";

import Books from "./pages/Books/Books";
import Categories from "./pages/Books/Categories";
import Pages from "./pages/Books/Pages";
import Page from "./pages/Books/Page";
import Info from "./pages/Books/Info";

import Settings from "./pages/Settings/Settings";

import "./assets/style/App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <SignIn />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
    ],
  },
  {
    path: "/activate/account/:authToken",
    element: <ActivateAccount />,
  },
  {
    path: "/reset/account/:authToken",
    element: <ResetPassword />,
  },
  {
    path: "/dashboard",
    element: (
      <Protect>
        <Dashboard />
      </Protect>
    ),
    children: [
      {
        index: true,
        element: <Boards />,
      },
      {
        path: "boards",
        element: <Boards />,
        children: [
          {
            path: "task/:boardId",
            element: <Tasks />,
          },
        ],
      },

      {
        path: "books",
        element: <Books />,
        children: [
          {
            path: ":bookId/categories",
            element: <Categories />,
            children: [
              {
                index: true,
                element: <Info />,
              },
              {
                path: ":subjectId/pages",
                element: <Pages />,
                children: [
                  {
                    index: true,
                    element: <Info />,
                  },
                  {
                    path: ":pageId",
                    element: <Page />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider>
    <RouterProvider router={router} />
  </Provider>
);
