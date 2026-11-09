import { registerHooks } from "node:module";

// Test-only resolution for Node's native TS stripping. Production resolution is
// left to Next.js; no test loader or mocking hook is imported by application code.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try { return nextResolve(specifier, context); }
    catch (error) {
      if (context.parentURL?.endsWith(".ts") && specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context);
      }
      throw error;
    }
  },
});
