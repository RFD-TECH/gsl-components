// Codemod for the 2.3 layout shell. AST-driven; TypeScript is resolved from
// the app being migrated rather than bundled.
import { access, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

// The slice of the compiler API this codemod calls, declared locally so the
// published CLI takes no build-time dependency on TypeScript's types.

interface TsNode {
  getStart(source?: TsSourceFile): number;
  getEnd(): number;
  getText(source?: TsSourceFile): string;
}

interface TsIdentifier extends TsNode {
  text: string;
}

interface TsStringLiteral extends TsNode {
  text: string;
}

interface TsJsxAttribute extends TsNode {
  name: TsNode;
  initializer?: TsNode;
}

interface TsJsxAttributes extends TsNode {
  properties: readonly TsNode[];
}

interface TsJsxElement extends TsNode {
  tagName: TsNode;
  attributes: TsJsxAttributes;
}

interface TsImportSpecifier extends TsNode {
  name: TsIdentifier;
  propertyName?: TsIdentifier;
}

interface TsNamedImports extends TsNode {
  elements: readonly TsImportSpecifier[];
}

interface TsImportDeclaration extends TsNode {
  moduleSpecifier: TsNode;
  importClause?: { namedBindings?: TsNode };
}

interface TsSourceFile extends TsNode {
  statements: readonly TsNode[];
  getLineAndCharacterOfPosition(position: number): { line: number };
}

interface TsApi {
  createSourceFile(
    fileName: string,
    text: string,
    target: number,
    setParentNodes: boolean,
    scriptKind: number,
  ): TsSourceFile;
  forEachChild(node: TsNode, visit: (child: TsNode) => void): void;
  ScriptTarget: { Latest: number };
  ScriptKind: { TSX: number };
  isIdentifier(node: TsNode): node is TsIdentifier;
  isImportDeclaration(node: TsNode): node is TsImportDeclaration;
  isJsxAttribute(node: TsNode): node is TsJsxAttribute;
  isJsxOpeningElement(node: TsNode): node is TsJsxElement;
  isJsxSelfClosingElement(node: TsNode): node is TsJsxElement;
  isNamedImports(node: TsNode): node is TsNamedImports;
  isNamespaceImport(node: TsNode): boolean;
  isStringLiteral(node: TsNode): node is TsStringLiteral;
}

const LIBRARY = "@rfdtech/components";
const SOURCE_EXTENSIONS = new Set([".tsx", ".jsx"]);
const SKIP_DIRECTORIES = new Set([
  ".cache",
  ".git",
  ".next",
  ".nuxt",
  ".output",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "storybook-static",
]);

/** Components whose variants this codemod knows how to move. */
const TRACKED = new Set([
  "AppLayout",
  "AppHeader",
  "Sidebar",
  "MetricCard",
  "Table",
  "TableContent",
]);

/** Exports renamed outright, at every reference to the same binding. */
interface ExportRename {
  to: string;
  /** Attribute renames applied to JSX elements of this component. */
  props?: Record<string, string>;
  /** Attributes that no longer do anything and are dropped. */
  dropProps?: string[];
  /** Printed once per rewritten element, for behaviour the rename can't carry. */
  note?: string;
}

const EXPORT_RENAMES: Record<string, ExportRename> = {
  // Migration guide section 1
  AppHeaderProfile: {
    to: "ProfilePopover",
    props: {
      onProfileClick: "onMyProfile",
      onSettingsClick: "onAccountSettings",
      onHelpClick: "onHelpAndSupport",
    },
    dropProps: ["headerAction"],
    note:
      "ProfilePopover confirms before signing out. Pass noConfirmSignOut to keep the old " +
      "fire-immediately behaviour.",
  },
  // Migration guide section 9, the JS half of the gsl -> clet rename. The CSS
  // half is a permanent alias and is deliberately left alone.
  gslTheme: { to: "cletTheme" },
  GslTheme: { to: "CletTheme" },
  GslThemeConfig: { to: "CletThemeConfig" },
  GslComponentThemeConfig: { to: "CletComponentThemeConfig" },
  GslComponentThemeOverrides: { to: "CletComponentThemeOverrides" },
  ResolvedGslTheme: { to: "ResolvedCletTheme" },
  GslColorValue: { to: "CletColorValue" },
  GslComponentTokenMap: { to: "CletComponentTokenMap" },
  GslGlobalTokens: { to: "CletGlobalTokens" },
  GslLengthValue: { to: "CletLengthValue" },
  GslOpacityValue: { to: "CletOpacityValue" },
  GslShadowValue: { to: "CletShadowValue" },
  GslStringValue: { to: "CletStringValue" },
  GslZIndexValue: { to: "CletZIndexValue" },
};

/** Migrations needing a human decision. Reported, never rewritten. */
const ADVISORY: Record<string, string> = {
  AppSwitcher:
    "AppSwitcher is deprecated in favour of Launchpad, and is not a drop-in replacement " +
    "(icons become SystemLaunchpadIcon/LaunchpadIconTile, the grid is a fixed 3x3, there is no " +
    "maxItems/columns/footer). Its maxItems also now defaults to 6, so a grid of more than six " +
    "apps needs maxItems set. Migration guide sections 2, 3 and 6.",
  CountrySelector:
    "CountrySelector is deprecated. Use Combobox with options built from your country data, or " +
    "PhoneNumberInput's built-in picker for phone entry. Migration guide section 7.",
  NetworkOperator:
    "NetworkOperator is deprecated. Use Combobox with options built from the same list, mapping " +
    "each `image` to the option's `icon`. Migration guide section 8.",
  TableContent:
    "A selectable TableContent with no rowActions no longer renders the empty kebab column. If " +
    "you relied on the Select/Deselect entry there, add an explicit row action. Migration guide " +
    "section 4.",
  cletTheme:
    "Token overrides need a per-token decision: some are deliberate brand choices, others only " +
    "existed to match the pre-rebrand defaults. Review each one rather than dropping the call. " +
    "Migration guide section 5.",
};

export interface MigrateOptions {
  /** Directory to walk. Defaults to the working directory. */
  root: string;
  /** Apply the edits. When false the run only reports what it would do. */
  write: boolean;
  /**
   * Pin the pre-2.3 appearance instead of adopting the new shell: AppLayout
   * goes to `panel`, and the brand-coloured header moves to `primary`.
   */
  preserve: boolean;
}

export interface MigrateChange {
  file: string;
  line: number;
  component: string;
  description: string;
}

export interface MigrateNote {
  file: string;
  line: number;
  message: string;
}

export interface MigrateResult {
  filesScanned: number;
  filesChanged: number;
  changes: MigrateChange[];
  notes: MigrateNote[];
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

function isWhitespace(character: string): boolean {
  return (
    character === " " ||
    character === "\t" ||
    character === "\n" ||
    character === "\r"
  );
}

/** What a tracked element's `variant` should become, or null to leave it be. */
type VariantTarget = { kind: "set"; value: string } | { kind: "remove" } | null;

function adoptTarget(component: string, current: string | null): VariantTarget {
  if (component === "AppHeader") {
    // `plain` keeps its name and changes meaning, so it needs no edit.
    if (current === null || current === "default") {
      return { kind: "set", value: "plain" };
    }
    return null;
  }

  if (component === "Sidebar") {
    // An unset sidebar is the panel surface, which is reported instead.
    if (current === "plain") return { kind: "set", value: "primary" };
    return null;
  }

  if (component === "MetricCard") {
    // `bordered` is a deliberate choice, not a default, so it is left alone.
    if (current === null || current === "default" || current === "outline") {
      return { kind: "set", value: "soft" };
    }
    return null;
  }

  if (component === "Table") {
    if (current === null) return { kind: "set", value: "soft" };
    return null;
  }

  if (component === "TableContent") {
    // An unset TableContent may not be in a soft Table, so it is reported.
    if (current === "panel") return { kind: "set", value: "soft" };
    return null;
  }

  // `variant="default"` is now redundant. `stacked` is left alone by design.
  if (current === "default") return { kind: "remove" };
  return null;
}

function preserveTarget(
  component: string,
  current: string | null,
): VariantTarget {
  if (component === "AppLayout") {
    if (current === null || current === "default") {
      return { kind: "set", value: "panel" };
    }
    return null;
  }

  if (component === "AppHeader" && current === "plain") {
    return { kind: "set", value: "primary" };
  }

  return null;
}

function describe(
  component: string,
  current: string | null,
  target: Exclude<VariantTarget, null>,
): string {
  const before = current === null ? "no variant" : `variant="${current}"`;
  const after = target.kind === "remove" ? "no variant" : `variant="${target.value}"`;
  return `${component}: ${before} -> ${after}`;
}

/**
 * Loads the compiler API from the app being migrated. Enters through
 * `lib/typescript.js` by absolute path: TypeScript 7's export map points `.` at
 * a version stub, while `lib/typescript.js` is the classic API in both 5.x and 7.x.
 */
async function loadTypeScript(root: string): Promise<TsApi> {
  const requireFrom = createRequire(path.join(root, "package.json"));
  let packageJsonPath: string;

  try {
    packageJsonPath = requireFrom.resolve("typescript/package.json");
  } catch {
    throw new Error(
      "`rfdui migrate` parses your JSX with the TypeScript compiler, and no `typescript` " +
        `was resolvable from ${root}. Install it (npm i -D typescript) and re-run.`,
    );
  }

  const classicApi = path.join(path.dirname(packageJsonPath), "lib", "typescript.js");
  try {
    await access(classicApi);
  } catch {
    throw new Error(
      `Found typescript at ${packageJsonPath} but no lib/typescript.js inside it, ` +
        "so the parser this codemod needs is missing. Report this with your typescript version.",
    );
  }

  const loaded = (await import(pathToFileURL(classicApi).href)) as {
    default?: TsApi;
  };
  const api = (loaded.default ?? loaded) as TsApi;

  if (typeof api.createSourceFile !== "function") {
    throw new Error(
      `The typescript at ${packageJsonPath} did not expose createSourceFile.`,
    );
  }

  return api;
}

async function collectSourceFiles(root: string): Promise<string[]> {
  const found: string[] = [];

  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRECTORIES.has(entry.name)) continue;
        await walk(full);
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
        found.push(full);
      }
    }
  }

  const rootStat = await stat(root);
  if (rootStat.isFile()) return [root];
  await walk(root);
  return found.sort();
}

interface LibraryImports {
  /** Local JSX name -> exported name, for the components this codemod tracks. */
  locals: Map<string, string>;
  /** Every name imported from the library, by its exported name. */
  imported: Set<string>;
  /** Local name -> exported name, for everything imported from the library. */
  localToExported: Map<string, string>;
  namespaceImport: TsNode | null;
}

/** Anything not imported from the library is left alone. */
function collectLibraryImports(ts: TsApi, source: TsSourceFile): LibraryImports {
  const locals = new Map<string, string>();
  const imported = new Set<string>();
  const localToExported = new Map<string, string>();
  let namespaceImport: TsNode | null = null;

  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (statement.moduleSpecifier.text !== LIBRARY) continue;

    const bindings = statement.importClause?.namedBindings;
    if (!bindings) continue;

    if (ts.isNamespaceImport(bindings)) {
      namespaceImport = bindings;
      continue;
    }

    if (!ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      const exported = (element.propertyName ?? element.name).text;
      imported.add(exported);
      localToExported.set(element.name.text, exported);
      if (TRACKED.has(exported)) locals.set(element.name.text, exported);
    }
  }

  return { locals, imported, localToExported, namespaceImport };
}

function findVariantAttribute(
  ts: TsApi,
  attributes: TsJsxAttributes,
): TsJsxAttribute | null {
  for (const property of attributes.properties) {
    if (!ts.isJsxAttribute(property)) continue;
    if (property.name.getText() === "variant") return property;
  }
  return null;
}

function migrateSource(
  ts: TsApi,
  filePath: string,
  text: string,
  options: MigrateOptions,
): { text: string; changes: MigrateChange[]; notes: MigrateNote[] } {
  const source = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const changes: MigrateChange[] = [];
  const notes: MigrateNote[] = [];
  const edits: Edit[] = [];
  const { locals, imported, localToExported, namespaceImport } =
    collectLibraryImports(ts, source);

  // Skip renames that would collide with a binding already imported here.
  const renames = new Map<string, ExportRename>();
  for (const [from, rename] of Object.entries(EXPORT_RENAMES)) {
    if (!imported.has(from)) continue;
    if (imported.has(rename.to)) continue;
    renames.set(from, rename);
  }

  const renamedLocals = new Map<string, ExportRename>();
  for (const [local, exported] of localToExported) {
    const rename = renames.get(exported);
    if (rename) renamedLocals.set(local, rename);
  }

  const lineOf = (position: number) =>
    source.getLineAndCharacterOfPosition(position).line + 1;

  if (namespaceImport) {
    notes.push({
      file: filePath,
      line: lineOf(namespaceImport.getStart(source)),
      message:
        `${LIBRARY} is imported as a namespace, so its JSX tags cannot be matched by name. ` +
        "Review this file's AppLayout/AppHeader/Sidebar variants by hand.",
    });
  }

  for (const [from, rename] of Object.entries(EXPORT_RENAMES)) {
    if (imported.has(from) && imported.has(rename.to)) {
      notes.push({
        file: filePath,
        line: 1,
        message:
          `Both ${from} and ${rename.to} are imported here, so renaming would collide. ` +
          `Move the ${from} usages over by hand and drop the import.`,
      });
    }
  }

  if (locals.size === 0 && renames.size === 0 && imported.size === 0) {
    return { text, changes, notes };
  }

  let sawStackedLayout: number | null = null;

  const advised = new Set<string>();
  const renameNoted = new Set<string>();

  const visit = (node: TsNode): void => {
    // An aliased import only matches its propertyName, so the local name stays.
    if (ts.isIdentifier(node)) {
      const rename = renames.get(node.text);
      if (rename) {
        edits.push({
          start: node.getStart(source),
          end: node.getEnd(),
          text: rename.to,
        });
        if (!renameNoted.has(node.text)) {
          renameNoted.add(node.text);
          changes.push({
            file: filePath,
            line: lineOf(node.getStart(source)),
            component: node.text,
            description: `${node.text} -> ${rename.to}`,
          });
          if (rename.note) {
            notes.push({
              file: filePath,
              line: lineOf(node.getStart(source)),
              message: rename.note,
            });
          }
        }
      }

      // One advisory per kind per file.
      const exported = localToExported.get(node.text);
      const advice = exported ? ADVISORY[exported] : undefined;
      if (advice && !advised.has(exported!)) {
        advised.add(exported!);
        notes.push({
          file: filePath,
          line: lineOf(node.getStart(source)),
          message: advice,
        });
      }
    }

    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tagName = node.tagName;

      if (ts.isIdentifier(tagName)) {
        const rename = renamedLocals.get(tagName.text);
        if (rename) {
          for (const property of node.attributes.properties) {
            if (!ts.isJsxAttribute(property)) continue;
            const attributeName = property.name.getText();

            const renamedProp = rename.props?.[attributeName];
            if (renamedProp) {
              edits.push({
                start: property.name.getStart(source),
                end: property.name.getEnd(),
                text: renamedProp,
              });
              changes.push({
                file: filePath,
                line: lineOf(property.getStart(source)),
                component: rename.to,
                description: `${attributeName} -> ${renamedProp}`,
              });
              continue;
            }

            if (rename.dropProps?.includes(attributeName)) {
              let start = property.getStart(source);
              while (start > 0 && isWhitespace(text[start - 1])) start -= 1;
              edits.push({ start, end: property.getEnd(), text: "" });
              changes.push({
                file: filePath,
                line: lineOf(property.getStart(source)),
                component: rename.to,
                description: `${attributeName} removed (no longer has any effect)`,
              });
            }
          }
        }
      }
      // Only bare identifiers: `<Rfd.Sidebar>` cannot be traced to an import
      // binding here, so it is left alone rather than guessed at.
      if (ts.isIdentifier(tagName)) {
        const component = locals.get(tagName.text);
        if (component) {
          const attribute = findVariantAttribute(ts, node.attributes);
          const initializer = attribute?.initializer;
          const line = lineOf(node.getStart(source));

          if (attribute && (!initializer || !ts.isStringLiteral(initializer))) {
            notes.push({
              file: filePath,
              line,
              message: `${component}'s variant is computed, not a literal. Decide it by hand.`,
            });
          } else {
            const current = initializer && ts.isStringLiteral(initializer)
              ? initializer.text
              : null;

            if (component === "AppLayout" && current === "stacked") {
              sawStackedLayout = line;
            }

            const target = options.preserve
              ? preserveTarget(component, current)
              : adoptTarget(component, current);

            if (
              !options.preserve &&
              component === "Sidebar" &&
              (current === null || current === "default")
            ) {
              notes.push({
                file: filePath,
                line,
                message:
                  "Sidebar has no variant (the panel surface). It only becomes the brand rail " +
                  'if this layout is flush. Set variant="primary" if it is.',
              });
            }

            if (
              !options.preserve &&
              component === "TableContent" &&
              (current === null || current === "default")
            ) {
              notes.push({
                file: filePath,
                line,
                message:
                  "TableContent has no variant. It only becomes the soft list treatment if its " +
                  'Table is variant="soft". Set variant="soft" if it is.',
              });
            }

            if (target) {
              if (target.kind === "remove" && attribute) {
                // Swallow leading whitespace so no double space is left.
                let start = attribute.getStart(source);
                while (start > 0 && isWhitespace(text[start - 1])) start -= 1;
                edits.push({ start, end: attribute.getEnd(), text: "" });
                changes.push({
                  file: filePath,
                  line,
                  component,
                  description: describe(component, current, target),
                });
              } else if (target.kind === "set") {
                if (initializer && ts.isStringLiteral(initializer)) {
                  edits.push({
                    start: initializer.getStart(source),
                    end: initializer.getEnd(),
                    text: `"${target.value}"`,
                  });
                } else {
                  edits.push({
                    start: tagName.getEnd(),
                    end: tagName.getEnd(),
                    text: ` variant="${target.value}"`,
                  });
                }
                changes.push({
                  file: filePath,
                  line,
                  component,
                  description: describe(component, current, target),
                });
              }
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  if (!options.preserve && sawStackedLayout !== null && changes.length > 0) {
    notes.push({
      file: filePath,
      line: sawStackedLayout,
      message:
        'AppLayout variant="stacked" was left as-is while the header/sidebar in this file moved ' +
        "to the new shell. Drop the variant to put the rail full-height under the new default.",
    });
  }

  if (edits.length === 0) return { text, changes, notes };

  // Back to front, so offsets stay valid.
  const ordered = [...edits].sort((a, b) => b.start - a.start);
  let next = text;
  for (const edit of ordered) {
    next = next.slice(0, edit.start) + edit.text + next.slice(edit.end);
  }

  return { text: next, changes, notes };
}

export async function runMigrate(options: MigrateOptions): Promise<MigrateResult> {
  // createRequire rejects a relative filename.
  const root = path.resolve(options.root);
  const ts = await loadTypeScript(root);
  const files = await collectSourceFiles(root);

  const changes: MigrateChange[] = [];
  const notes: MigrateNote[] = [];
  let filesChanged = 0;

  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (!text.includes(LIBRARY)) continue;

    const result = migrateSource(ts, file, text, options);
    changes.push(...result.changes);
    notes.push(...result.notes);

    if (result.text !== text) {
      filesChanged += 1;
      if (options.write) await writeFile(file, result.text, "utf8");
    }
  }

  return { filesScanned: files.length, filesChanged, changes, notes };
}
