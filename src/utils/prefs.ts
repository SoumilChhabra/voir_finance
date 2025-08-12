import { Preferences } from "@capacitor/preferences";

export async function getPrefStr(key: string) {
  const { value } = await Preferences.get({ key });
  return value ?? null;
}
export async function setPrefStr(key: string, val: string) {
  await Preferences.set({ key, value: val });
}
