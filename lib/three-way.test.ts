import { describe, expect, it } from "vitest";
import { mergeList, mergeRecord, same } from "@/lib/three-way";

type Item = { id: string; title: string; text: string };

const item = (id: string, change: Partial<Item> = {}): Item => ({ id, title: id, text: "", ...change });
const ids = (items: Item[] | null) => items?.map(({ id }) => id).join("") ?? null;
const list = (letters: string) => [...letters].map((id) => item(id));
const merge = (base: Item[], next: Item[], current: Item[]) =>
  mergeList(base, next, current, ({ id }) => id, mergeRecord);

describe("same", () => {
  it("ignora a ordem das chaves, que o jsonb não guarda", () => {
    expect(same({ a: 1, b: { c: 1, d: 2 } }, { b: { d: 2, c: 1 }, a: 1 })).toBe(true);
    expect(same(["a", "b"], ["b", "a"])).toBe(false);
  });
});

describe("mergeRecord", () => {
  const base = item("a");

  it("junta campos diferentes", () => {
    expect(mergeRecord(base, { ...base, title: "novo" }, { ...base, text: "salvo" })).toEqual(
      item("a", { title: "novo", text: "salvo" }),
    );
  });

  it("não escolhe entre dois valores do mesmo campo", () => {
    expect(mergeRecord(base, { ...base, title: "X" }, { ...base, title: "Y" })).toBeNull();
  });

  it("o mesmo valor nos dois não é conflito", () => {
    const edited = { ...base, title: "igual" };
    expect(mergeRecord(base, edited, edited)).toEqual(edited);
  });

  it("um campo opcional que não existia conta como campo", () => {
    type Noted = { id: string; note?: string };
    expect(mergeRecord<Noted>({ id: "a" }, { id: "a", note: "minha" }, { id: "a" })).toEqual({ id: "a", note: "minha" });
    expect(mergeRecord<Noted>({ id: "a", note: "velha" }, { id: "a" }, { id: "a", note: "velha" })?.note).toBeUndefined();
  });

  it("não recria o que foi apagado", () => {
    expect(mergeRecord(base, { ...base, title: "novo" }, undefined)).toBeNull();
  });

  it("cria o novo e aceita só o reenvio idêntico", () => {
    expect(mergeRecord(undefined, base, undefined)).toEqual(base);
    expect(mergeRecord(undefined, base, base)).toEqual(base);
    expect(mergeRecord(undefined, base, { ...base, title: "outro" })).toBeNull();
  });
});

describe("mergeList", () => {
  it("junta edições em itens diferentes", () => {
    const merged = merge(list("ab"), [item("a", { text: "meu" }), item("b")], [item("a"), item("b", { text: "dele" })]);
    expect(merged).toEqual([item("a", { text: "meu" }), item("b", { text: "dele" })]);
  });

  it("junta campos diferentes do mesmo item", () => {
    const merged = merge(list("a"), [item("a", { text: "meu" })], [item("a", { title: "dele" })]);
    expect(merged).toEqual([item("a", { text: "meu", title: "dele" })]);
  });

  it("os novos dos dois ficam, cada um perto do vizinho", () => {
    expect(ids(merge(list("abc"), list("axbc"), list("abcy")))).toBe("axbcy");
    expect(ids(merge(list("ab"), list("xab"), list("ab")))).toBe("xab");
    expect(ids(merge([], list("xy"), list("z")))).toBe("xyz");
  });

  it("remove só o que a tela removeu e não traz de volta o que o outro removeu", () => {
    expect(ids(merge(list("abc"), list("bc"), list("ab")))).toBe("b");
  });

  it("mantém a ordem de quem reordenou", () => {
    expect(ids(merge(list("abc"), list("cab"), list("abcy")))).toBe("cyab");
    expect(ids(merge(list("abc"), list("abcx"), list("cab")))).toBe("cxab");
  });

  it("duas ordens diferentes é conflito, a mesma não", () => {
    expect(merge(list("abc"), list("bac"), list("acb"))).toBeNull();
    expect(ids(merge(list("abc"), list("bac"), list("bac")))).toBe("bac");
  });

  it("editar o que o outro apagou, ou apagar o que ele editou, é conflito", () => {
    expect(merge(list("a"), [item("a", { text: "meu" })], [])).toBeNull();
    expect(merge(list("a"), [], [item("a", { text: "dele" })])).toBeNull();
  });

  it("o mesmo campo do mesmo item é conflito", () => {
    expect(merge(list("a"), [item("a", { text: "X" })], [item("a", { text: "Y" })])).toBeNull();
  });
});
