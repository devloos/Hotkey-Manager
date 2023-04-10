import { Toast, getPreferenceValues, showToast } from "@raycast/api";
import { randomUUID } from "crypto";
import { ModifierKeys, SupportedApplications } from "./assets/constants";
import { $_SM_getShortcuts } from "./assets/mixins";

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

export function arraysEqual(a: string[], b: string[]) {
  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export async function hasHotkeyConflicts(uuid: string, hotkey: string[], source: string): Promise<boolean> {
  const appsToCheck = ["system", "raycast"];
  if (!appsToCheck.includes(source)) {
    appsToCheck.push(source);
  }

  hotkey.sort();

  for (let i = 0; i < appsToCheck.length; ++i) {
    const shortcuts = (await $_SM_getShortcuts(appsToCheck[i])).filter((el) => el.uuid !== uuid);
    for (let j = 0; j < shortcuts.length; ++j) {
      const clone = structuredClone(shortcuts[j].hotkey).sort();
      if (arraysEqual(clone, hotkey)) {
        return true;
      }
    }
  }

  return false;
}

// modifies array in place
export function addPreferencesToArray(data: App[]) {
  const preferences = getPreferenceValues();

  Object.keys(preferences).forEach((key) => {
    if (preferences[key]) {
      const idx = SupportedApplications.findIndex((el) => el.source === key);
      if (idx >= 0 && !data.some((el) => el.source === key)) {
        data.push(SupportedApplications[idx]);
      }
    } else {
      // just desk checking that data does not contain non preference
      const idx = data.findIndex((el) => el.source === key);
      if (idx >= 0) {
        data.splice(idx, 1);
      }
    }
  });
}
