import ts from "typescript";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export function sourceFiles(directory = "src") {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? sourceFiles(`${directory}/${entry.name}`) : /\.tsx?$/.test(entry.name) ? [`${directory}/${entry.name}`] : []);
}

export function analyzeDependencies(sources) {
  const errors = [], graph = new Map();
  const owner = file => /^src\/features\/([^/]+)\//.exec(file)?.[1] ?? (file.startsWith("src/lib/auth/") ? "auth" : null);
  const resolve = (from, specifier) => {
    const base = specifier.startsWith("@/") ? path.posix.normalize(`src/${specifier.slice(2)}`) : specifier.startsWith(".") ? path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier)) : null;
    return base && [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`, base.replace(/\.js$/, ".ts"), base.replace(/\.jsx$/, ".tsx")].find(file => Object.hasOwn(sources, file));
  };
  for (const [file, text] of Object.entries(sources)) {
    const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const dependencies = [];
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) dependencies.push(node.moduleSpecifier.text);
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(ast) === "require") && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) dependencies.push(node.arguments[0].text);
      if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) dependencies.push(node.argument.literal.text);
      if (owner(file) && ts.isCallExpression(node) && /(?:\.registerPlugin|\.ticker\.lagSmoothing)$/.test(node.expression.getText(ast))) errors.push(`${file}: features must not reconfigure global animation infrastructure`);
      ts.forEachChild(node, visit);
    }
    visit(ast);
    if (/^src\/features\/[^/]+\/contracts\.ts$/.test(file)) {
      for (const node of ast.statements) {
        if (!(ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly) || (ts.isExportDeclaration(node) && node.isTypeOnly))) errors.push(`${file}: feature contracts must remain type-only, without runtime implementation exports`);
      }
    }
    graph.set(file, []);
    for (const specifier of dependencies) {
      const target = resolve(file, specifier), feature = owner(file), targetFeature = target && owner(target);
      const fail = reason => errors.push(`${file} -> ${specifier}: ${reason}`);
      const publicEntry = target && (/^src\/features\/[^/]+\/(page|client|server|contracts|fixtures|api|member-layout|sign-in-modal)\.tsx?$/.test(target) || /^src\/lib\/auth\/(server|http|validation|types)\.ts$/.test(target));
      const draftingAdapter = target && file.startsWith("src/components/cad/") && target === file.replace("src/components/cad/", "src/features/drafting/components/");
      if (specifier.includes("tests/") || specifier.startsWith("node:test")) fail("runtime must not import tests");
      if (specifier.startsWith("@supabase/") && file !== "src/lib/auth/provider.ts") fail("vendor SDK belongs to the auth provider adapter");
      if (/^gsap(?:\/|$)/.test(specifier) && file !== "src/shared/animation.ts") fail("animation configuration belongs to the shared adapter");
      if (feature && (specifier.startsWith("@/app/") || target?.startsWith("src/app/"))) fail("features must not depend on application routes");
      if (feature && targetFeature && feature !== targetFeature && target !== "src/features/auth/client.ts" && !/\/contracts\.ts$/.test(target)) fail("cross-feature implementation dependency");
      if (!feature && targetFeature && !publicEntry && !draftingAdapter) fail("application consumers must use a public feature entry point");
      if (feature && target && /src\/(context|components|data|types)\//.test(target)) fail("feature must not use a legacy compatibility adapter");
      if (file.startsWith("src/shared/") && target && (targetFeature || target.startsWith("src/app/"))) fail("shared infrastructure cannot depend on features");
      if ((/^src\/features\/[^/]+\/(model|data|services)\//.test(file) || file.startsWith("src/shared/contracts/")) && (/^(react|next|gsap|lenis)(\/|$)/.test(specifier) || (target && (/\/use-[^/]+\./.test(target) || target.endsWith(".tsx") || target === "src/features/auth/client.ts" || target === "src/shared/animation.ts")))) fail("domain logic must not depend on UI or controller code");
      if (target) graph.get(file).push(target);
    }
    if (/^src\/app\/(?:.*\/)?page\.tsx$/.test(file)) {
      if (ast.statements.length !== 1 || !ts.isExportDeclaration(ast.statements[0]) || !/^@\/features\/[^/]+\/page$/.test(ast.statements[0].moduleSpecifier?.text ?? "")) errors.push(`${file}: page must delegate to a public feature entry point`);
    }
  }
  const visiting = new Set(), complete = new Set();
  function walk(file, trail) {
    if (visiting.has(file)) { errors.push(`dependency cycle: ${[...trail, file].join(" -> ")}`); return; }
    if (complete.has(file)) return;
    visiting.add(file);
    for (const dependency of graph.get(file) ?? []) walk(dependency, [...trail, file]);
    visiting.delete(file); complete.add(file);
  }
  for (const file of graph.keys()) walk(file, []);
  return errors;
}

export const readSources = () => Object.fromEntries(sourceFiles().map(file => [file, readFileSync(file, "utf8")]));
