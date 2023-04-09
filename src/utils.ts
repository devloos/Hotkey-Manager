import { Toast, showToast } from "@raycast/api";
import { randomUUID } from "crypto";
import { ModifierKeys } from "./assets/constants";

export interface App {
  title: string;
  source: string;
  icon: string;
}

export function AppDefault(): App {
  return { title: "System", source: "system", icon: "apps/system.png" };
}

export interface Shortcut {
  uuid: string;
  command: string;
  when: string;
  hotkey: string[];
}

export function ShortcutDefault(): Shortcut {
  return { uuid: randomUUID(), command: "", when: "", hotkey: [] };
}

export interface Logo {
  title: string;
  source: string;
  path: string;
}

export function LogoDefault(): Logo {
  return { title: "", source: "", path: "" };
}

export function hotkeyToString(hotkeys: string[]): string {
  let hotkey = "";
  hotkeys.forEach((el) => {
    hotkey += el + " + ";
  });

  hotkey = hotkey.slice(0, hotkey.length - 2).trim();
  return hotkey;
}

export function formatHotkey(hotkeys: string[]) {
  ModifierKeys.reverse().forEach((key) => {
    const idx = hotkeys.findIndex((el) => el === key);
    if (idx >= 0) {
      hotkeys.splice(0, 0, hotkeys.splice(idx, 1)[0]);
    }
  });
}

export function isValidShortcut(shortcut: Shortcut): boolean {
  if (!shortcut.uuid) {
    showToast({
      title: "UUID missing.",
      style: Toast.Style.Failure,
    });
    return false;
  }

  if (!shortcut.command) {
    showToast({
      title: "Command missing.",
      style: Toast.Style.Failure,
    });
    return false;
  }

  if (!shortcut.when) {
    showToast({
      title: "When clause missing.",
      style: Toast.Style.Failure,
    });
    return false;
  }

  if (arrayEmpty(shortcut.hotkey)) {
    showToast({
      title: "Hotkey missing.",
      style: Toast.Style.Failure,
    });
    return false;
  }

  if (!ModifierKeys.some((el) => shortcut.hotkey.includes(el))) {
    showToast({
      title: "Modifier(s) missing.",
      style: Toast.Style.Failure,
    });
    return false;
  }

  return true;
}

export function arrayEmpty(data: string[] | Shortcut[] | App[]): boolean {
  return data.length === 0;
}
