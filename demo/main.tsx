import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./App";
import "./demo.css";

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={createBrowserRouter(routes)} />,
);
