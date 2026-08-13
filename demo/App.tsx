import type { RouteRecord } from "vite-react-ssg";
import { ClientOnly } from "vite-react-ssg";
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
import { DocsPage } from "./pages/DocsPage";
import { getAllDocSlugs } from "./docs/registry";

export const routes: RouteRecord[] = [
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
          { path: "users/new", element: <UserCreatePage /> },
          { path: "users/:userId", element: <UserDetailPage /> },
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
        element: (
          <ClientOnly>
            {() => <Navigate to="/docs/getting-started" replace />}
          </ClientOnly>
        ),
      },
      {
        path: "docs/:componentId",
        element: <DocsPage />,
        getStaticPaths: () => getAllDocSlugs().map((slug) => `docs/${slug}`),
      },
      {
        path: "*",
        element: <ClientOnly>{() => <Navigate to="/" replace />}</ClientOnly>,
      },
    ],
  },
];
