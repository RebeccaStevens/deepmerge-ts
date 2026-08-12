import { describe, expect, it } from "vitest";

import { deepmerge, deepmergeCustom } from "../src/index.ts";

describe("deepmerge circular references", () => {
  it("merging circular references", () => {
    const a = {
      foo: { value: 1 },
      bar: { value: 2 },
    } as any;
    a.ref = a;
    a.foo.ref = a;
    a.foo.ref2 = a;
    a.bar.ref = a;

    const b = {
      foo: { value: 3 },
      bar: { value: 4 },
    } as any;
    b.ref = b;
    b.foo.ref = b;
    b.foo.ref2 = b;
    b.bar.ref = b.foo; // Deliberately a different reference to `a.bar.ref`.

    const expected = {
      foo: { value: 3 },
      bar: { value: 4 },
    } as any;
    expected.ref = expected;
    expected.foo.ref = expected;
    expected.foo.ref2 = expected;
    expected.bar.ref = expected.foo;

    const merged = deepmerge(a, b);

    expect(merged).toStrictEqual(expected);
  });

  it("merging simple circular objects", () => {
    const a = { foo: 1 } as any;
    a.self = a;

    const b = { bar: 2 } as any;
    b.self = b;

    const merged: any = deepmerge(a, b);

    expect(merged.foo).toBe(1);
    expect(merged.bar).toBe(2);
    expect(merged.self).toBe(merged);
  });

  it("merging nested circular objects", () => {
    const a = { level1: { level2: { value: "a" } } } as any;
    a.level1.level2.root = a;

    const b = { level1: { level2: { value: "b" } } } as any;
    b.level1.level2.root = b;

    const merged: any = deepmerge(a, b);

    expect(merged.level1.level2.value).toBe("b");
    expect(merged.level1.level2.root).toBe(merged);
  });

  it("merging circular references to intermediate child object", () => {
    const a = { child: { val: 1 } } as any;
    a.child.self = a.child;

    const b = { child: { val: 2 } } as any;
    b.child.self = b.child;

    const merged: any = deepmerge(a, b);

    expect(merged.child.val).toBe(2);
    expect(merged.child.self).toBe(merged.child);
  });

  it("merging circular maps", () => {
    const mapA = new Map<string, unknown>([["key1", "val1"]]);
    mapA.set("self", mapA);

    const mapB = new Map<string, unknown>([["key2", "val2"]]);
    mapB.set("self", mapB);

    const merged: any = deepmerge(mapA, mapB);

    expect(merged.get("key1")).toBe("val1");
    expect(merged.get("key2")).toBe("val2");
    expect(merged.get("self")).toBe(merged);
  });

  it("merging objects containing circular maps", () => {
    const mapA = new Map<string, unknown>();
    const a = { map: mapA } as any;
    mapA.set("parent", a);

    const mapB = new Map<string, unknown>();
    const b = { map: mapB } as any;
    mapB.set("parent", b);

    const merged: any = deepmerge(a, b);

    expect(merged.map.get("parent")).toBe(merged);
  });

  it("merging nested circular maps", () => {
    const outerA = new Map<string, unknown>();
    const innerA = new Map<string, unknown>();
    outerA.set("inner", innerA);
    innerA.set("root", outerA);

    const outerB = new Map<string, unknown>();
    const innerB = new Map<string, unknown>();
    outerB.set("inner", innerB);
    innerB.set("root", outerB);

    const merged: any = deepmerge(outerA, outerB);

    expect(merged.get("inner").get("root")).toBe(merged);
  });

  it("merging circular sets", () => {
    const setA = new Set<unknown>();
    setA.add(setA);

    const setB = new Set<unknown>();
    setB.add(setB);

    const merged: any = deepmerge(setA, setB);

    expect(merged).toBeInstanceOf(Set);
    expect(merged.has(setA)).toBe(true);
    expect(merged.has(setB)).toBe(true);
  });

  it("merging objects containing circular sets", () => {
    const setA = new Set<unknown>();
    const a = { set: setA };
    setA.add(a);

    const setB = new Set<unknown>();
    const b = { set: setB };
    setB.add(b);

    const merged: any = deepmerge(a, b);

    expect(merged.set).toBeInstanceOf(Set);
    expect(merged.set.has(a)).toBe(true);
    expect(merged.set.has(b)).toBe(true);
  });

  it("merging circular arrays", () => {
    const arrA: unknown[] = [1];
    arrA.push(arrA);

    const arrB: unknown[] = [2];
    arrB.push(arrB);

    const merged: any = deepmerge(arrA, arrB);

    expect(merged[0]).toBe(1);
    expect(merged[1]).toBe(arrA);
    expect(merged[2]).toBe(2);
    expect(merged[3]).toBe(arrB);
  });

  it("merging objects containing circular arrays", () => {
    const arrA: unknown[] = [10];
    const a = { arr: arrA };
    arrA.push(a);

    const arrB: unknown[] = [20];
    const b = { arr: arrB };
    arrB.push(b);

    const merged: any = deepmerge(a, b);

    expect(merged.arr[0]).toBe(10);
    expect(merged.arr[1]).toBe(a);
    expect(merged.arr[2]).toBe(20);
    expect(merged.arr[3]).toBe(b);
  });

  it("merging mutually referencing circular objects (A <-> B)", () => {
    const a1: any = { name: "a1" };
    const b1: any = { name: "b1", refA: a1 };
    a1.refB = b1;

    const a2: any = { name: "a2", extraA: true };
    const b2: any = { name: "b2", extraB: true, refA: a2 };
    a2.refB = b2;

    const merged: any = deepmerge(a1, a2);

    expect(merged.name).toBe("a2");
    expect(merged.extraA).toBe(true);
    expect(merged.refB.name).toBe("b2");
    expect(merged.refB.extraB).toBe(true);
    expect(merged.refB.refA).toBe(merged);
    expect(merged.refB.refA.refB).toBe(merged.refB);
  });

  it("merging 3-node cyclic graph (A -> B -> C -> A)", () => {
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

    const merged: any = deepmerge(a1, a2);

    expect(merged.name).toBe("a2");
    expect(merged.propA).toBe(1);
    expect(merged.next.name).toBe("b2");
    expect(merged.next.propB).toBe(2);
    expect(merged.next.next.name).toBe("c2");
    expect(merged.next.next.propC).toBe(3);
    expect(merged.next.next.next).toBe(merged);
    expect(merged.next.next.next.next).toBe(merged.next);
  });

  it("merging mutually referencing maps", () => {
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

    const merged: any = deepmerge(mapA1, mapA2);

    expect(merged.get("name")).toBe("mapA2");
    expect(merged.get("extraA")).toBe(true);
    const mergedB = merged.get("refB");
    expect(mergedB.get("name")).toBe("mapB2");
    expect(mergedB.get("extraB")).toBe(true);
    expect(mergedB.get("refA")).toBe(merged);
  });

  it("merging mutually referencing arrays", () => {
    const arrA1: unknown[] = ["a1"];
    const arrB1: unknown[] = ["b1"];
    arrA1.push(arrB1);
    arrB1.push(arrA1);

    const arrA2: unknown[] = ["a2"];
    const arrB2: unknown[] = ["b2"];
    arrA2.push(arrB2);
    arrB2.push(arrA2);

    const merged: any = deepmerge(arrA1, arrA2);

    expect(merged[0]).toBe("a1");
    expect(merged[1]).toBe(arrB1);
    expect(merged[2]).toBe("a2");
    expect(merged[3]).toBe(arrB2);
  });

  it("merging 3 or more circular objects", () => {
    const a: any = { a: 1, shared: "a" };
    a.self = a;

    const b: any = { b: 2, shared: "b" };
    b.self = b;

    const c: any = { c: 3, shared: "c" };
    c.self = c;

    const d: any = { d: 4, shared: "d" };
    d.self = d;

    const merged: any = deepmerge(a, b, c, d);

    expect(merged.a).toBe(1);
    expect(merged.b).toBe(2);
    expect(merged.c).toBe(3);
    expect(merged.d).toBe(4);
    expect(merged.shared).toBe("d");
    expect(merged.self).toBe(merged);
  });

  it("merging 3 nested circular objects", () => {
    const a: any = { nested: { val: 1, propA: "a" } };
    a.nested.root = a;

    const b: any = { nested: { val: 2, propB: "b" } };
    b.nested.root = b;

    const c: any = { nested: { val: 3, propC: "c" } };
    c.nested.root = c;

    const merged: any = deepmerge(a, b, c);

    expect(merged.nested.val).toBe(3);
    expect(merged.nested.propA).toBe("a");
    expect(merged.nested.propB).toBe("b");
    expect(merged.nested.propC).toBe("c");
    expect(merged.nested.root).toBe(merged);
  });

  it("merging 3 mutually referencing circular objects", () => {
    const a1: any = { name: "a1", valA: 1 };
    const b1: any = { name: "b1", valB: 1, refA: a1 };
    a1.refB = b1;

    const a2: any = { name: "a2", valA: 2 };
    const b2: any = { name: "b2", valB: 2, refA: a2 };
    a2.refB = b2;

    const a3: any = { name: "a3", valA: 3, extra: true };
    const b3: any = { name: "b3", valB: 3, refA: a3, extra: true };
    a3.refB = b3;

    const merged: any = deepmerge(a1, a2, a3);

    expect(merged.name).toBe("a3");
    expect(merged.valA).toBe(3);
    expect(merged.extra).toBe(true);
    expect(merged.refB.name).toBe("b3");
    expect(merged.refB.valB).toBe(3);
    expect(merged.refB.extra).toBe(true);
    expect(merged.refB.refA).toBe(merged);
    expect(merged.refB.refA.refB).toBe(merged.refB);
  });

  it("merging 3 or more circular maps", () => {
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

    const merged: any = deepmerge(map1, map2, map3);

    expect(merged.get("k1")).toBe("v1");
    expect(merged.get("k2")).toBe("v2");
    expect(merged.get("k3")).toBe("v3");
    expect(merged.get("shared")).toBe(3);
    expect(merged.get("self")).toBe(merged);
  });

  it("merging 3 circular sets", () => {
    const set1 = new Set<unknown>(["s1"]);
    set1.add(set1);

    const set2 = new Set<unknown>(["s2"]);
    set2.add(set2);

    const set3 = new Set<unknown>(["s3"]);
    set3.add(set3);

    const merged: any = deepmerge(set1, set2, set3);

    expect(merged).toBeInstanceOf(Set);
    expect(merged.has("s1")).toBe(true);
    expect(merged.has("s2")).toBe(true);
    expect(merged.has("s3")).toBe(true);
    expect(merged.has(set1)).toBe(true);
    expect(merged.has(set2)).toBe(true);
    expect(merged.has(set3)).toBe(true);
  });

  it("merging 3 circular arrays", () => {
    const arr1: unknown[] = [1];
    arr1.push(arr1);

    const arr2: unknown[] = [2];
    arr2.push(arr2);

    const arr3: unknown[] = [3];
    arr3.push(arr3);

    const merged: any = deepmerge(arr1, arr2, arr3);

    expect(merged[0]).toBe(1);
    expect(merged[1]).toBe(arr1);
    expect(merged[2]).toBe(2);
    expect(merged[3]).toBe(arr2);
    expect(merged[4]).toBe(3);
    expect(merged[5]).toBe(arr3);
  });

  it("merging 3 objects where some are circular and some are non-circular", () => {
    const a: any = { x: 1, y: { val: 10 } };
    a.self = a;

    const b: any = { x: 2, y: { val: 20 } };

    const c: any = { x: 3, y: { val: 30 } };
    c.self = c;

    const merged: any = deepmerge(a, b, c);

    expect(merged.x).toBe(3);
    expect(merged.y.val).toBe(30);
    expect(merged.self).toBe(merged);
  });

  it("custom mergeCircularReferences function", () => {
    const customizedDeepmerge = deepmergeCustom({
      mergeCircularReferences: (values: any, cyclicDepths: any) => `[CIRCULAR_DEPTH_${cyclicDepths[0]}]`,
    });

    const a = { foo: 1 } as any;
    a.self = a;

    const b = { bar: 2 } as any;
    b.self = b;

    const merged: any = customizedDeepmerge(a, b);

    expect(merged.foo).toBe(1);
    expect(merged.bar).toBe(2);
    expect(merged.self).toBe("[CIRCULAR_DEPTH_1]");
  });
});
