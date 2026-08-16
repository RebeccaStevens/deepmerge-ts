import { describe, expect, it } from "vitest";

/**
 * A merge function that merges sources into a target, mutating the target in place.
 */
export type IntoMergeFn = (target: Record<string, unknown>, ...sources: ReadonlyArray<Record<string, unknown>>) => void;

/**
 * A merge function that merges sources into a fresh result without mutating them.
 */
export type MergeFn = (...sources: ReadonlyArray<Record<string, unknown>>) => unknown;

/**
 * Tests the mutation, copy and share semantics of a `deepmergeInto`-style merge function.
 *
 * @param merge - The merge function to test.
 */
export function testIntoMutationAndCopySemantics(merge: IntoMergeFn) {
  describe("does not mutate sources", () => {
    it("does not mutate source objects or their nested containers when the target lacks the keys", () => {
      const a = {
        items: [1, 2],
        record: { items: [1, 2] },
        set: new Set([1, 2]),
        map: new Map<string, number | { items: number[] }>([
          ["a", 1],
          ["b", { items: [1] }],
        ]),
      };
      const b = {
        items: [3, 4],
        record: { items: [3, 4] },
        set: new Set([3, 4]),
        map: new Map<string, number | { items: number[] }>([
          ["b", { items: [2] }],
          ["c", 3],
        ]),
      };
      const itemsRef = a.items;
      const recordRef = a.record;
      const recordItemsRef = a.record.items;
      const setRef = a.set;
      const mapRef = a.map;
      const mapValueRef = a.map.get("b");
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);

      const target: Record<string, unknown> = {};
      merge(target, a, b);

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
      expect(a.items).toBe(itemsRef);
      expect(a.record).toBe(recordRef);
      expect(a.record.items).toBe(recordItemsRef);
      expect(a.set).toBe(setRef);
      expect(a.map).toBe(mapRef);
      expect(a.map.get("b")).toBe(mapValueRef);
      expect(target).toStrictEqual({
        items: [1, 2, 3, 4],
        record: { items: [1, 2, 3, 4] },
        set: new Set([1, 2, 3, 4]),
        map: new Map<string, number | { items: number[] }>([
          ["a", 1],
          ["b", { items: [1, 2] }],
          ["c", 3],
        ]),
      });
    });

    it("does not mutate source objects or their nested containers when the target already has the keys", () => {
      const a = {
        items: [1, 2],
        record: { items: [1, 2] },
        set: new Set([1, 2]),
        map: new Map<string, number | { items: number[] }>([
          ["a", 1],
          ["b", { items: [1] }],
        ]),
      };
      const b = {
        items: [3, 4],
        record: { items: [3, 4] },
        set: new Set([3, 4]),
        map: new Map<string, number | { items: number[] }>([
          ["b", { items: [2] }],
          ["c", 3],
        ]),
      };
      const target = {
        items: [0],
        record: { items: [0] },
        set: new Set([0]),
        map: new Map<string, number | { items: number[] }>([["d", 4]]),
      };
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);

      merge(target, a, b);

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
      expect(target).toStrictEqual({
        items: [0, 1, 2, 3, 4],
        record: { items: [0, 1, 2, 3, 4] },
        set: new Set([0, 1, 2, 3, 4]),
        map: new Map<string, number | { items: number[] }>([
          ["a", 1],
          ["b", { items: [1, 2] }],
          ["c", 3],
          ["d", 4],
        ]),
      });
    });

    it("does not mutate sources across repeated calls into fresh targets", () => {
      const a = { sub: { items: [1, 2], set: new Set([1]), map: new Map([["a", 1]]) } };
      const b = { sub: { items: [3, 4], set: new Set([2]), map: new Map([["b", 2]]) } };
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);

      for (let i = 0; i < 50; i++) {
        merge({}, a, b);
      }

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
    });

    it("does not mutate sources across repeated calls into a reused target", () => {
      const a = { sub: { set: new Set([1]), map: new Map([["a", 1]]) } };
      const b = { sub: { set: new Set([2]), map: new Map([["b", 2]]) } };
      const target = { sub: { set: new Set([0]), map: new Map([["c", 3]]) } };
      const targetSubRef = target.sub;
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);

      for (let i = 0; i < 50; i++) {
        merge(target, a, b);
      }

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
      expect(target.sub).toBe(targetSubRef);
      expect(target.sub.set).toStrictEqual(new Set([0, 1, 2]));
      expect(target.sub.map).toStrictEqual(
        new Map([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]),
      );
    });

    it("does not alias-mutate map values that are maps, sets, or arrays across repeated calls", () => {
      const a = {
        m: new Map<string, Map<string, number> | Set<number> | number[]>([
          ["map", new Map([["x", 1]])],
          ["set", new Set([1, 2])],
          ["arr", [1, 2]],
        ]),
      };
      const b = {
        m: new Map<string, Map<string, number> | Set<number> | number[]>([
          ["map", new Map([["y", 2]])],
          ["set", new Set([2, 3])],
          ["arr", [3, 4]],
        ]),
      };
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);

      for (let i = 0; i < 50; i++) {
        merge({}, a, b);
      }

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
    });

    it("does not mutate sources or drop entries when merging 3 or more maps into a fresh target", () => {
      const a = { m: new Map([["k", { a: 1 }]]) };
      const b = { m: new Map([["k", { b: 2 }]]) };
      const c = { m: new Map([["k", { c: 3 }]]) };
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);
      const expectedC = structuredClone(c);

      const target: Record<string, unknown> = {};
      merge(target, a, b, c);

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
      expect(c).toStrictEqual(expectedC);
      const mergedValue = (target["m"] as Map<string, unknown>).get("k");
      expect(mergedValue).toStrictEqual({ a: 1, b: 2, c: 3 });
      expect(mergedValue).not.toBe(a.m.get("k"));
      expect(mergedValue).not.toBe(b.m.get("k"));
      expect(mergedValue).not.toBe(c.m.get("k"));
    });
  });

  describe("copy and share semantics", () => {
    it("creates fresh containers when a key is merged from multiple sources", () => {
      const a = { arr: [1, 2], record: { x: 1 }, set: new Set([1]), map: new Map([["a", 1]]) };
      const b = { arr: [3, 4], record: { y: 2 }, set: new Set([2]), map: new Map([["b", 2]]) };

      const target: Record<string, unknown> = {};
      merge(target, a, b);

      expect(target["arr"]).toStrictEqual([1, 2, 3, 4]);
      expect(target["arr"]).not.toBe(a.arr);
      expect(target["arr"]).not.toBe(b.arr);
      expect(target["record"]).toStrictEqual({ x: 1, y: 2 });
      expect(target["record"]).not.toBe(a.record);
      expect(target["record"]).not.toBe(b.record);
      expect(target["set"]).toStrictEqual(new Set([1, 2]));
      expect(target["set"]).not.toBe(a.set);
      expect(target["set"]).not.toBe(b.set);
      expect(target["map"]).toStrictEqual(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      );
      expect(target["map"]).not.toBe(a.map);
      expect(target["map"]).not.toBe(b.map);
    });

    it("creates fresh containers at every level of a deep merge", () => {
      const a = { outer: { inner: { arr: [1], set: new Set([1]), map: new Map([["a", 1]]) } } };
      const b = { outer: { inner: { arr: [2], set: new Set([2]), map: new Map([["b", 2]]) } } };

      const target: Record<string, unknown> = {};
      merge(target, a, b);

      const outer = target["outer"] as { inner: { arr: number[]; set: Set<number>; map: Map<string, number> } };
      expect(outer).not.toBe(a.outer);
      expect(outer.inner).not.toBe(a.outer.inner);
      expect(outer.inner.arr).toStrictEqual([1, 2]);
      expect(outer.inner.arr).not.toBe(a.outer.inner.arr);
      expect(outer.inner.set).toStrictEqual(new Set([1, 2]));
      expect(outer.inner.set).not.toBe(a.outer.inner.set);
      expect(outer.inner.map).toStrictEqual(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      );
      expect(outer.inner.map).not.toBe(a.outer.inner.map);
    });

    it("shares references for keys present in a single source", () => {
      const date = new Date(0);
      const a = { onlyA: { x: 1 }, arr: [1], set: new Set([1]), map: new Map([["a", 1]]), date };
      const b = { onlyB: { y: 2 } };

      const target: Record<string, unknown> = {};
      merge(target, a, b);

      expect(target["onlyA"]).toBe(a.onlyA);
      expect(target["arr"]).toBe(a.arr);
      expect(target["set"]).toBe(a.set);
      expect(target["map"]).toBe(a.map);
      expect(target["date"]).toBe(a.date);
      expect(target["onlyB"]).toBe(b.onlyB);
    });

    it("shares leaf and other values when multiple sources provide them", () => {
      const date = new Date(0);
      const regexp = /a/gu;
      const a = { date: new Date(1), regexp: /b/gu, str: "first", num: 1 };
      const b = { date, regexp, str: "second", num: 2 };

      const target: Record<string, unknown> = {};
      merge(target, a, b);

      expect(target["date"]).toBe(date);
      expect(target["regexp"]).toBe(regexp);
      expect(target["str"]).toBe("second");
      expect(target["num"]).toBe(2);
    });

    it("keeps the target's own containers in place when the target already has the key", () => {
      const target = { arr: [1, 2], record: { x: 1 }, set: new Set([1]), map: new Map([["a", 1]]) };
      const a = { arr: [3], record: { y: 2 }, set: new Set([2]), map: new Map([["b", 2]]) };
      const arrRef = target.arr;
      const recordRef = target.record;
      const setRef = target.set;
      const mapRef = target.map;

      merge(target, a);

      expect(target.arr).toBe(arrRef);
      expect(target.record).toBe(recordRef);
      expect(target.set).toBe(setRef);
      expect(target.map).toBe(mapRef);
      expect(target.arr).not.toBe(a.arr);
      expect(target.set).not.toBe(a.set);
      expect(target.map).not.toBe(a.map);
    });

    it("shares array elements and single-source map values, but merges multi-source map values into a fresh container", () => {
      const sharedElem = { id: 1 };
      const singleSourceValue = { v: 1 };
      const a = {
        arr: [sharedElem],
        map: new Map<string, { v: number } | { n: number }>([
          ["k", singleSourceValue],
          ["both", { n: 1 }],
        ]),
      };
      const b = {
        arr: [{ id: 2 }],
        map: new Map<string, { v: number } | { n: number }>([
          ["k2", { v: 2 }],
          ["both", { n: 2 }],
        ]),
      };

      const target: Record<string, unknown> = {};
      merge(target, a, b);

      const arr = target["arr"] as unknown[];
      expect(arr[0]).toBe(sharedElem);

      const map = target["map"] as Map<string, unknown>;
      expect(map.get("k")).toBe(singleSourceValue);
      expect(map.get("k2")).toStrictEqual({ v: 2 });
      expect(map.get("both")).toStrictEqual({ n: 2 });
      expect(map.get("both")).not.toBe(a.map.get("both"));
    });
  });

  describe("mutates the target", () => {
    it("mutates the target in place and preserves its identity", () => {
      const target = { a: 1 };
      const source = { b: 2 };

      merge(target, source);

      expect(target).toStrictEqual({ a: 1, b: 2 });
    });

    it("mutates the target's existing nested containers in place", () => {
      const target = { arr: [1], record: { x: 1 }, set: new Set([1]), map: new Map([["a", 1]]) };
      const source = { arr: [2, 3], record: { y: 2 }, set: new Set([2]), map: new Map([["b", 2]]) };
      const arrRef = target.arr;
      const recordRef = target.record;
      const setRef = target.set;
      const mapRef = target.map;

      merge(target, source);

      expect(target.arr).toBe(arrRef);
      expect(target.arr).toStrictEqual([1, 2, 3]);
      expect(target.record).toBe(recordRef);
      expect(target.record).toStrictEqual({ x: 1, y: 2 });
      expect(target.set).toBe(setRef);
      expect(target.set).toStrictEqual(new Set([1, 2]));
      expect(target.map).toBe(mapRef);
      expect(target.map).toStrictEqual(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      );
    });

    it("adds properties from the sources to the target", () => {
      const target = { a: 1 };

      merge(target, { b: 2 }, { c: 3 });

      expect(target).toStrictEqual({ a: 1, b: 2, c: 3 });
    });

    it("merges a target's existing map values in place when they are containers", () => {
      const target = {
        map: new Map<string, unknown>([
          ["record", { a: 1 }],
          ["array", [1]],
          ["set", new Set([1])],
          ["map", new Map([["x", 1]])],
        ]),
      };
      const a = {
        map: new Map<string, unknown>([
          ["record", { b: 2 }],
          ["array", [2, 3]],
          ["set", new Set([2])],
          ["map", new Map([["y", 2]])],
        ]),
      };
      const recordRef = target.map.get("record");
      const arrayRef = target.map.get("array");
      const setRef = target.map.get("set");
      const mapRef = target.map.get("map");

      merge(target, a);

      expect(target.map.get("record")).toBe(recordRef);
      expect(target.map.get("record")).toStrictEqual({ a: 1, b: 2 });
      expect(target.map.get("array")).toBe(arrayRef);
      expect(target.map.get("array")).toStrictEqual([1, 2, 3]);
      expect(target.map.get("set")).toBe(setRef);
      expect(target.map.get("set")).toStrictEqual(new Set([1, 2]));
      expect(target.map.get("map")).toBe(mapRef);
      expect(target.map.get("map")).toStrictEqual(
        new Map([
          ["x", 1],
          ["y", 2],
        ]),
      );
      expect(target.map.get("record")).not.toBe(a.map.get("record"));
      expect(target.map.get("array")).not.toBe(a.map.get("array"));
      expect(target.map.get("set")).not.toBe(a.map.get("set"));
      expect(target.map.get("map")).not.toBe(a.map.get("map"));
    });
  });
}

/**
 * Tests the source mutation and copy/share semantics of a non-mutating merge function.
 *
 * @param merge - The merge function to test.
 */
export function testSourceMutationAndCopySemantics(merge: MergeFn) {
  describe("does not mutate sources", () => {
    it("does not mutate source objects or their nested containers", () => {
      const a = {
        items: [1, 2],
        record: { items: [1, 2] },
        set: new Set([1, 2]),
        map: new Map<string, number | { items: number[] }>([
          ["a", 1],
          ["b", { items: [1] }],
        ]),
      };
      const b = {
        items: [3, 4],
        record: { items: [3, 4] },
        set: new Set([3, 4]),
        map: new Map<string, number | { items: number[] }>([
          ["b", { items: [2] }],
          ["c", 3],
        ]),
      };
      const itemsRef = a.items;
      const recordRef = a.record;
      const recordItemsRef = a.record.items;
      const setRef = a.set;
      const mapRef = a.map;
      const mapValueRef = a.map.get("b");
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);

      const merged = merge(a, b) as Record<string, unknown>;

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
      expect(a.items).toBe(itemsRef);
      expect(a.record).toBe(recordRef);
      expect(a.record.items).toBe(recordItemsRef);
      expect(a.set).toBe(setRef);
      expect(a.map).toBe(mapRef);
      expect(a.map.get("b")).toBe(mapValueRef);
      expect(merged).toStrictEqual({
        items: [1, 2, 3, 4],
        record: { items: [1, 2, 3, 4] },
        set: new Set([1, 2, 3, 4]),
        map: new Map<string, number | { items: number[] }>([
          ["a", 1],
          ["b", { items: [1, 2] }],
          ["c", 3],
        ]),
      });
    });

    it("does not mutate sources across repeated calls", () => {
      const a = { sub: { items: [1, 2], set: new Set([1]), map: new Map([["a", 1]]) } };
      const b = { sub: { items: [3, 4], set: new Set([2]), map: new Map([["b", 2]]) } };
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);

      for (let i = 0; i < 50; i++) {
        merge(a, b);
      }

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
    });

    it("does not alias-mutate map values that are maps, sets, or arrays across repeated calls", () => {
      const a = {
        m: new Map<string, Map<string, number> | Set<number> | number[]>([
          ["map", new Map([["x", 1]])],
          ["set", new Set([1, 2])],
          ["arr", [1, 2]],
        ]),
      };
      const b = {
        m: new Map<string, Map<string, number> | Set<number> | number[]>([
          ["map", new Map([["y", 2]])],
          ["set", new Set([2, 3])],
          ["arr", [3, 4]],
        ]),
      };
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);

      for (let i = 0; i < 50; i++) {
        merge(a, b);
      }

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
    });

    it("merges 3 or more maps without mutating sources or dropping the first source's entries", () => {
      const a = { m: new Map([["k", { a: 1 }]]) };
      const b = { m: new Map([["k", { b: 2 }]]) };
      const c = { m: new Map([["k", { c: 3 }]]) };
      const expectedA = structuredClone(a);
      const expectedB = structuredClone(b);
      const expectedC = structuredClone(c);

      const merged = merge(a, b, c) as Record<string, unknown>;

      expect(a).toStrictEqual(expectedA);
      expect(b).toStrictEqual(expectedB);
      expect(c).toStrictEqual(expectedC);
      const mergedValue = (merged["m"] as Map<string, unknown>).get("k");
      expect(mergedValue).toStrictEqual({ a: 1, b: 2, c: 3 });
      expect(mergedValue).not.toBe(a.m.get("k"));
      expect(mergedValue).not.toBe(b.m.get("k"));
      expect(mergedValue).not.toBe(c.m.get("k"));
    });
  });

  describe("copy and share semantics", () => {
    it("creates a fresh result with fresh containers when a key is merged from multiple sources", () => {
      const a = { arr: [1, 2], record: { x: 1 }, set: new Set([1]), map: new Map([["a", 1]]) };
      const b = { arr: [3, 4], record: { y: 2 }, set: new Set([2]), map: new Map([["b", 2]]) };

      const merged = merge(a, b) as Record<string, unknown>;

      expect(merged).not.toBe(a);
      expect(merged).not.toBe(b);
      expect(merged["arr"]).toStrictEqual([1, 2, 3, 4]);
      expect(merged["arr"]).not.toBe(a.arr);
      expect(merged["arr"]).not.toBe(b.arr);
      expect(merged["record"]).toStrictEqual({ x: 1, y: 2 });
      expect(merged["record"]).not.toBe(a.record);
      expect(merged["record"]).not.toBe(b.record);
      expect(merged["set"]).toStrictEqual(new Set([1, 2]));
      expect(merged["set"]).not.toBe(a.set);
      expect(merged["set"]).not.toBe(b.set);
      expect(merged["map"]).toStrictEqual(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      );
      expect(merged["map"]).not.toBe(a.map);
      expect(merged["map"]).not.toBe(b.map);
    });

    it("creates fresh containers at every level of a deep merge", () => {
      const a = { outer: { inner: { arr: [1], set: new Set([1]), map: new Map([["a", 1]]) } } };
      const b = { outer: { inner: { arr: [2], set: new Set([2]), map: new Map([["b", 2]]) } } };

      const merged = merge(a, b) as Record<string, unknown>;

      const outer = merged["outer"] as { inner: { arr: number[]; set: Set<number>; map: Map<string, number> } };
      expect(outer).not.toBe(a.outer);
      expect(outer.inner).not.toBe(a.outer.inner);
      expect(outer.inner.arr).toStrictEqual([1, 2]);
      expect(outer.inner.arr).not.toBe(a.outer.inner.arr);
      expect(outer.inner.set).toStrictEqual(new Set([1, 2]));
      expect(outer.inner.set).not.toBe(a.outer.inner.set);
      expect(outer.inner.map).toStrictEqual(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      );
      expect(outer.inner.map).not.toBe(a.outer.inner.map);
    });

    it("shares references for keys present in a single source", () => {
      const date = new Date(0);
      const a = { onlyA: { x: 1 }, arr: [1], set: new Set([1]), map: new Map([["a", 1]]), date };
      const b = { onlyB: { y: 2 } };

      const merged = merge(a, b) as Record<string, unknown>;

      expect(merged["onlyA"]).toBe(a.onlyA);
      expect(merged["arr"]).toBe(a.arr);
      expect(merged["set"]).toBe(a.set);
      expect(merged["map"]).toBe(a.map);
      expect(merged["date"]).toBe(a.date);
      expect(merged["onlyB"]).toBe(b.onlyB);
    });

    it("shares leaf and other values when multiple sources provide them", () => {
      const date = new Date(0);
      const regexp = /a/gu;
      const a = { date: new Date(1), regexp: /b/gu, str: "first", num: 1 };
      const b = { date, regexp, str: "second", num: 2 };

      const merged = merge(a, b) as Record<string, unknown>;

      expect(merged["date"]).toBe(date);
      expect(merged["regexp"]).toBe(regexp);
      expect(merged["str"]).toBe("second");
      expect(merged["num"]).toBe(2);
    });

    it("shares array elements and single-source map values, but merges multi-source map values into a fresh container", () => {
      const sharedElem = { id: 1 };
      const singleSourceValue = { v: 1 };
      const a = {
        arr: [sharedElem],
        map: new Map<string, { v: number } | { n: number }>([
          ["k", singleSourceValue],
          ["both", { n: 1 }],
        ]),
      };
      const b = {
        arr: [{ id: 2 }],
        map: new Map<string, { v: number } | { n: number }>([
          ["k2", { v: 2 }],
          ["both", { n: 2 }],
        ]),
      };

      const merged = merge(a, b) as Record<string, unknown>;

      const arr = merged["arr"] as unknown[];
      expect(arr[0]).toBe(sharedElem);

      const map = merged["map"] as Map<string, unknown>;
      expect(map.get("k")).toBe(singleSourceValue);
      expect(map.get("k2")).toStrictEqual({ v: 2 });
      expect(map.get("both")).toStrictEqual({ n: 2 });
      expect(map.get("both")).not.toBe(a.map.get("both"));
    });
  });
}
