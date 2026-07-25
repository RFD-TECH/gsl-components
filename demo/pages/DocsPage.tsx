import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { DocsLayout } from "../components/DocsLayout";
import { DocsSidebar } from "../components/DocsSidebar";
import { mdxComponents } from "../docs/mdx-components";
import { getAllDocSlugs, getDocPage } from "../docs/registry";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@rfdtech/components";
import { Search } from "lucide-react";
import { cn } from "../../src/utils/cn";

const SCROLL_THRESHOLD = 10;
const MIN_SCROLL_THRESHOLD = 250;

const DocsHeader = ({
  setSearchOpen,
}: {
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [headerHidden, setheaderHidden] = useState(false);
  const prevScrollY = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - prevScrollY.current;

      if (currentScrollY <= MIN_SCROLL_THRESHOLD) {
        setheaderHidden(false);
      } else {
        if (diff < -SCROLL_THRESHOLD) {
          setheaderHidden(false);
        } else if (diff > SCROLL_THRESHOLD) {
          setheaderHidden(true);
        }
      }

      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <header className={cn("demo-header", headerHidden ? "demo-header-up" : "")}>
      <Link to="/" className="demo-logo">
        Clet Components
      </Link>
      <nav className="demo-nav">
        <button
          type="button"
          className="demo-nav-link demo-docs-search-btn"
          onClick={() => setSearchOpen(true)}
          aria-label="Search docs"
        >
          <Search size={14} strokeWidth={1.5} />
          <span
            style={{
              marginLeft: 6,
              color: "var(--clet-text-muted)",
              fontSize: 12,
            }}
          >
            Search docs...
          </span>
          <kbd className="clet-app-header__search-kbd ml-2">⌘K</kbd>
        </button>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            ["demo-nav-link", isActive ? "demo-nav-link--active" : ""]
              .filter(Boolean)
              .join(" ")
          }
        >
          Demo
        </NavLink>
        <NavLink
          to="/docs"
          className={({ isActive }) =>
            ["demo-nav-link", isActive ? "demo-nav-link--active" : ""]
              .filter(Boolean)
              .join(" ")
          }
        >
          Docs
        </NavLink>
        <ThemeToggle />
      </nav>
    </header>
  );
};

export function DocsPage() {
  const { componentId = "getting-started" } = useParams<{
    componentId?: string;
  }>();
  const page = getDocPage(componentId);
  const Content = page?.default;
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);

  const docPages = useMemo(() => {
    return getAllDocSlugs().map((slug) => {
      const p = getDocPage(slug);
      return {
        slug,
        title: p?.meta?.title ?? slug,
        description: p?.meta?.description ?? "",
      };
    });
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => setSearchOpen(open),
    [],
  );

  return (
    <>
      <CommandDialog
        open={searchOpen}
        onOpenChange={handleOpenChange}
        shortcut="mod+k"
      >
        <CommandInput placeholder="Search documentation..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {docPages.map((doc) => (
              <CommandItem
                key={doc.slug}
                value={`${doc.title} ${doc.slug}`}
                onSelect={() => {
                  navigate(`/docs/${doc.slug}`);
                  setSearchOpen(false);
                }}
              >
                <span style={{ fontWeight: 500 }}>{doc.title}</span>
                {doc.description && (
                  <span
                    style={{
                      color: "var(--clet-text-muted)",
                      marginLeft: 8,
                      fontSize: 12,
                    }}
                  >
                    {doc.description}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <DocsHeader setSearchOpen={setSearchOpen} />
      <DocsLayout mainClassName="demo-docs" pageClassName="demo-docs-page">
        <div className="demo-docs__layout">
          <aside className="demo-docs__sidebar">
            <DocsSidebar />
          </aside>
          <article className="demo-docs__content">
            {Content ? (
              <Content components={mdxComponents} />
            ) : (
              <div className="demo-docs__404">
                <h2>Page not found</h2>
                <p>
                  The page <code>{componentId}</code> does not exist.
                </p>
              </div>
            )}
          </article>
        </div>
      </DocsLayout>
    </>
  );
}
