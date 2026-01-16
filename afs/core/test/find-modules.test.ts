import { expect, test } from "bun:test";
import { AFS, type AFSModule } from "@aigne/afs";

test("AFS.findModules should match modules correctly", () => {
  const moduleA: AFSModule = {
    name: "module-a",
  };

  const afs = new AFS().mount(moduleA);

  // Test matching at root level - should match modules
  expect(afs["findModules"]("/")).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/modules",
    },
  ]);

  // Test matching /modules - should show module-a at depth 0
  expect(afs["findModules"]("/modules")).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/module-a",
    },
  ]);

  // Test matching /modules/module-a - should match with subpath /
  expect(afs["findModules"]("/modules/module-a")).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 1,
      subpath: "/",
      remainedModulePath: "/",
    },
  ]);

  // Test matching /modules/module-a/foo - should match with subpath /foo
  expect(afs["findModules"]("/modules/module-a/foo")).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 1,
      subpath: "/foo",
      remainedModulePath: "/",
    },
  ]);

  // Test with maxDepth 2 at root
  expect(afs["findModules"]("/", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 0,
      subpath: "/",
      remainedModulePath: "/modules/module-a",
    },
  ]);

  // Test with maxDepth 2 at /modules
  expect(afs["findModules"]("/modules", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 1,
      subpath: "/",
      remainedModulePath: "/module-a",
    },
  ]);

  // Test with maxDepth 2 at /modules/module-a
  expect(afs["findModules"]("/modules/module-a", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 2,
      subpath: "/",
      remainedModulePath: "/",
    },
  ]);

  // Test with maxDepth 2 at /modules/module-a/foo
  expect(afs["findModules"]("/modules/module-a/foo", { maxDepth: 2 })).toContainAllValues([
    {
      module: moduleA,
      modulePath: "/modules/module-a",
      maxDepth: 2,
      subpath: "/foo",
      remainedModulePath: "/",
    },
  ]);
});
