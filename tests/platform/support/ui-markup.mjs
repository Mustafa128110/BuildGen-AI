import ts from "typescript";
import { createHash } from "node:crypto";

export function markupFingerprints(source) {
  // Ignore line endings and trailing formatting spaces, not JSX content changes.
  const normalized = source.replaceAll("\r\n", "\n").replace(/[\t ]+$/gm, "");
  const ast = ts.createSourceFile("view.tsx", normalized, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fingerprints = [];
  function visit(node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) fingerprints.push(createHash("sha256").update(node.getText(ast)).digest("hex"));
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return fingerprints.sort();
}
