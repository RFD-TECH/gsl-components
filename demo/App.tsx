import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeToggle";
import { DemoLayout } from "./components/DemoLayout";
import { DemoLayout2 } from "./components/DemoLayout2";
import { DemoLayout3 } from "./components/DemoLayout3";
import { DemoPage } from "./pages/DemoPage";
import { Dashboard2Page } from "./pages/Dashboard2Page";
import { Dashboard3Page } from "./pages/Dashboard3Page";
import { UserCreatePage } from "./pages/UserCreatePage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UserCreatePage3 } from "./pages/UserCreatePage3";
import { UserDetailPage3 } from "./pages/UserDetailPage3";
import { DocsPage } from "./pages/DocsPage";
import { ShowcasePage } from "./pages/ShowcasePage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ThemeProvider defaultTheme="system" storageKey="clet-theme">
        <Outlet />
      </ThemeProvider>
    ),
    children: [
      {
        // 2.3, the current shell: primary Sidebar rail, plain AppHeader
        element: <DemoLayout3 />,
        children: [
          { index: true, element: <Dashboard3Page /> },
          { path: "showcase", element: <ShowcasePage /> },
          { path: "users/new", element: <UserCreatePage3 /> },
          { path: "users/:userId", element: <UserDetailPage3 /> },
        ],
      },
      {
        // 2.2, the previous shell, unchanged, reachable via the version switcher
        path: "v2",
        element: <DemoLayout2 basePath="/v2" />,
        children: [
          { index: true, element: <Dashboard2Page /> },
          { path: "users/new", element: <UserCreatePage /> },
          { path: "users/:userId", element: <UserDetailPage /> },
        ],
      },
      {
        // 1.22, pre-rebrand panels, unchanged, reachable via the version switcher
        element: <DemoLayout />,
        children: [{ path: "legacy", element: <DemoPage /> }],
      },
      {
        path: "docs",
        element: <Navigate to="/docs/getting-started" replace />,
      },
      {
        path: "docs/:componentId",
        element: <DocsPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
];
