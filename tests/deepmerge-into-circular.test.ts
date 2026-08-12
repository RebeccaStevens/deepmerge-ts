import { describe, expect, it } from "vitest";

import { type DeepMergeValueReference, deepmergeInto, deepmergeIntoCustom } from "../src/index.ts";

describe("deepmergeInto circular references", () => {
  it("merging circular references", () => {
    const target = {
      foo: { value: 1 },
      bar: { value: 2 },
    } as any;
    target.ref = target;
    target.foo.ref = target;
    target.foo.ref2 = target;
    target.bar.ref = target;

    const source = {
      foo: { value: 3 },
      bar: { value: 4 },
    } as any;
    source.ref = source;
    source.foo.ref = source;
    source.foo.ref2 = source;
    source.bar.ref = source.foo;

    deepmergeInto(target, source);

    expect(target.foo.value).toBe(3);
    expect(target.bar.value).toBe(4);
    expect(target.ref).toBe(target);
    expect(target.foo.ref).toBe(target);
    expect(target.foo.ref2).toBe(target);
    expect(target.bar.ref).toStrictEqual(target.foo);
  });

  it("merging simple circular objects into target", () => {
    const target = { foo: 1 } as any;
    target.self = target;

    const source = { bar: 2 } as any;
    source.self = source;

    deepmergeInto(target, source);

    expect(target.foo).toBe(1);
    expect(target.bar).toBe(2);
    expect(target.self).toBe(target);
  });

  it("merging nested circular objects into target", () => {
    const target = { level1: { level2: { value: "a" } } } as any;
    target.level1.level2.root = target;

    const source = { level1: { level2: { value: "b" } } } as any;
    source.level1.level2.root = source;

    deepmergeInto(target, source);

    expect(target.level1.level2.value).toBe("b");
    expect(target.level1.level2.root).toBe(target);
  });

  it("merging circular references to intermediate child object into target", () => {
    const target = { child: { val: 1 } } as any;
    target.child.self = target.child;

    const source = { child: { val: 2 } } as any;
    source.child.self = source.child;

    deepmergeInto(target, source);

    expect(target.child.val).toBe(2);
    expect(target.child.self).toBe(target.child);
  });

  it("merging circular maps into target", () => {
    const targetMap = new Map<string, unknown>([["key1", "val1"]]);
    targetMap.set("self", targetMap);

    const sourceMap = new Map<string, unknown>([["key2", "val2"]]);
    sourceMap.set("self", sourceMap);

    deepmergeInto(targetMap, sourceMap);

    expect(targetMap.get("key1")).toBe("val1");
    expect(targetMap.get("key2")).toBe("val2");
    expect(targetMap.get("self")).toBe(targetMap);
  });

  it("merging objects containing circular maps into target", () => {
    const mapA = new Map<string, unknown>();
    const target = { map: mapA } as any;
    mapA.set("parent", target);

    const mapB = new Map<string, unknown>();
    const source = { map: mapB } as any;
    mapB.set("parent", source);

    deepmergeInto(target, source);

    expect(target.map.get("parent")).toBe(target);
  });

  it("merging circular sets into target", () => {
    const targetSet = new Set<unknown>();
    targetSet.add(targetSet);

    const sourceSet = new Set<unknown>();
    sourceSet.add(sourceSet);

    deepmergeInto(targetSet, sourceSet);

    expect(targetSet.has(targetSet)).toBe(true);
    expect(targetSet.has(sourceSet)).toBe(true);
  });

  it("merging circular arrays into target", () => {
    const targetArr: unknown[] = [1];
    targetArr.push(targetArr);

    const sourceArr: unknown[] = [2];
    sourceArr.push(sourceArr);

    deepmergeInto(targetArr, sourceArr);

    expect(targetArr[0]).toBe(1);
    expect(targetArr[1]).toBe(targetArr);
    expect(targetArr[2]).toBe(2);
    expect(targetArr[3]).toBe(sourceArr);
  });

  it("merging mutually referencing circular objects into target (A <-> B)", () => {
    const a1: any = { name: "a1" };
    const b1: any = { name: "b1", refA: a1 };
    a1.refB = b1;

    const a2: any = { name: "a2", extraA: true };
    const b2: any = { name: "b2", extraB: true, refA: a2 };
    a2.refB = b2;

    deepmergeInto(a1, a2);

    expect(a1.name).toBe("a2");
    expect(a1.extraA).toBe(true);
    expect(a1.refB.name).toBe("b2");
    expect(a1.refB.extraB).toBe(true);
    expect(a1.refB.refA).toBe(a1);
    expect(a1.refB.refA.refB).toBe(a1.refB);
  });

  it("merging 3-node cyclic graph into target (A -> B -> C -> A)", () => {
    const a1: any = { name: "a1" };
    const b1: any = { name: "b1" };
    const c1: any = { name: "c1" };
    a1.next = b1;
    b1.next = c1;
    c1.next = a1;

    const a2: any = { name: "a2", propA: 1 };
    const b2: any = { name: "b2", propB: 2 };
    const c2: any = { name: "c2", propC: 3 };
    a2.next = b2;
    b2.next = c2;
    c2.next = a2;

    deepmergeInto(a1, a2);

    expect(a1.name).toBe("a2");
    expect(a1.propA).toBe(1);
    expect(a1.next.name).toBe("b2");
    expect(a1.next.propB).toBe(2);
    expect(a1.next.next.name).toBe("c2");
    expect(a1.next.next.propC).toBe(3);
    expect(a1.next.next.next).toBe(a1);
    expect(a1.next.next.next.next).toBe(a1.next);
  });

  it("merging mutually referencing maps into target", () => {
    const mapA1 = new Map<string, unknown>([["name", "mapA1"]]);
    const mapB1 = new Map<string, unknown>([["name", "mapB1"]]);
    mapA1.set("refB", mapB1);
    mapB1.set("refA", mapA1);

    const mapA2 = new Map<string, unknown>([
      ["name", "mapA2"],
      ["extraA", true],
    ]);
    const mapB2 = new Map<string, unknown>([
      ["name", "mapB2"],
      ["extraB", true],
    ]);
    mapA2.set("refB", mapB2);
    mapB2.set("refA", mapA2);

    deepmergeInto(mapA1, mapA2);

    expect(mapA1.get("name")).toBe("mapA2");
    expect(mapA1.get("extraA")).toBe(true);
    const mergedB: any = mapA1.get("refB");
    expect(mergedB.get("name")).toBe("mapB2");
    expect(mergedB.get("extraB")).toBe(true);
    expect(mergedB.get("refA")).toBe(mapA1);
  });

  it("merging 3 or more circular objects into target", () => {
    const a: any = { a: 1, shared: "a" };
    a.self = a;

    const b: any = { b: 2, shared: "b" };
    b.self = b;

    const c: any = { c: 3, shared: "c" };
    c.self = c;

    const d: any = { d: 4, shared: "d" };
    d.self = d;

    deepmergeInto(a, b, c, d);

    expect(a.a).toBe(1);
    expect(a.b).toBe(2);
    expect(a.c).toBe(3);
    expect(a.d).toBe(4);
    expect(a.shared).toBe("d");
    expect(a.self).toBe(a);
  });

  it("merging 3 nested circular objects into target", () => {
    const a: any = { nested: { val: 1, propA: "a" } };
    a.nested.root = a;

    const b: any = { nested: { val: 2, propB: "b" } };
    b.nested.root = b;

    const c: any = { nested: { val: 3, propC: "c" } };
    c.nested.root = c;

    deepmergeInto(a, b, c);

    expect(a.nested.val).toBe(3);
    expect(a.nested.propA).toBe("a");
    expect(a.nested.propB).toBe("b");
    expect(a.nested.propC).toBe("c");
    expect(a.nested.root).toBe(a);
  });

  it("merging 3 mutually referencing circular objects into target", () => {
    const a1: any = { name: "a1", valA: 1 };
    const b1: any = { name: "b1", valB: 1, refA: a1 };
    a1.refB = b1;

    const a2: any = { name: "a2", valA: 2 };
    const b2: any = { name: "b2", valB: 2, refA: a2 };
    a2.refB = b2;

    const a3: any = { name: "a3", valA: 3, extra: true };
    const b3: any = { name: "b3", valB: 3, refA: a3, extra: true };
    a3.refB = b3;

    deepmergeInto(a1, a2, a3);

    expect(a1.name).toBe("a3");
    expect(a1.valA).toBe(3);
    expect(a1.extra).toBe(true);
    expect(a1.refB.name).toBe("b3");
    expect(a1.refB.valB).toBe(3);
    expect(a1.refB.extra).toBe(true);
    expect(a1.refB.refA).toBe(a1);
    expect(a1.refB.refA.refB).toBe(a1.refB);
  });

  it("merging 3 or more circular maps into target", () => {
    const map1 = new Map<string, unknown>([
      ["k1", "v1"],
      ["shared", 1],
    ]);
    map1.set("self", map1);

    const map2 = new Map<string, unknown>([
      ["k2", "v2"],
      ["shared", 2],
    ]);
    map2.set("self", map2);

    const map3 = new Map<string, unknown>([
      ["k3", "v3"],
      ["shared", 3],
    ]);
    map3.set("self", map3);

    deepmergeInto(map1, map2, map3);

    expect(map1.get("k1")).toBe("v1");
    expect(map1.get("k2")).toBe("v2");
    expect(map1.get("k3")).toBe("v3");
    expect(map1.get("shared")).toBe(3);
    expect(map1.get("self")).toBe(map1);
  });

  it("merging 3 circular sets into target", () => {
    const set1 = new Set<unknown>(["s1"]);
    set1.add(set1);

    const set2 = new Set<unknown>(["s2"]);
    set2.add(set2);

    const set3 = new Set<unknown>(["s3"]);
    set3.add(set3);

    deepmergeInto(set1, set2, set3);

    expect(set1.has("s1")).toBe(true);
    expect(set1.has("s2")).toBe(true);
    expect(set1.has("s3")).toBe(true);
    expect(set1.has(set1)).toBe(true);
    expect(set1.has(set2)).toBe(true);
    expect(set1.has(set3)).toBe(true);
  });

  it("merging 3 circular arrays into target", () => {
    const arr1: unknown[] = [1];
    arr1.push(arr1);

    const arr2: unknown[] = [2];
    arr2.push(arr2);

    const arr3: unknown[] = [3];
    arr3.push(arr3);

    deepmergeInto(arr1, arr2, arr3);

    expect(arr1[0]).toBe(1);
    expect(arr1[1]).toBe(arr1);
    expect(arr1[2]).toBe(2);
    expect(arr1[3]).toBe(arr2);
    expect(arr1[4]).toBe(3);
    expect(arr1[5]).toBe(arr3);
  });

  it("merging 3 objects into target where some are circular and some are non-circular", () => {
    const a: any = { x: 1, y: { val: 10 } };
    a.self = a;

    const b: any = { x: 2, y: { val: 20 } };

    const c: any = { x: 3, y: { val: 30 } };
    c.self = c;

    deepmergeInto(a, b, c);

    expect(a.x).toBe(3);
    expect(a.y.val).toBe(30);
    expect(a.self).toBe(a);
  });

  it("custom mergeCircularReferences function", () => {
    const customizedDeepmerge = deepmergeIntoCustom({
      mergeCircularReferences: (mut_target: DeepMergeValueReference<unknown>) => {
        mut_target.value = "[CUSTOM_CIRCULAR]";
      },
    });

    const target = { foo: 1 } as any;
    target.self = target;

    const source = { bar: 2 } as any;
    source.self = source;

    customizedDeepmerge(target, source);

    expect(target.foo).toBe(1);
    expect(target.bar).toBe(2);
    expect(target.self).toBe("[CUSTOM_CIRCULAR]");
  });
});
