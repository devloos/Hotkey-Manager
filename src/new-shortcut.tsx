import { Action, ActionPanel, Form, Toast, popToRoot, showToast } from "@raycast/api";
import { App, isValidShortcut, Shortcut, formatHotkey } from "./utils";
import {
  $_hotkey_getApps,
  $_hotkey_getShortcuts,
  $_hotkey_initializeState,
  $_hotkey_setShortcuts,
} from "./assets/mixins";
import { Keys, ModifierKeys } from "./assets/constants";
import { useEffect, useState } from "react";
import { randomUUID } from "crypto";

export default function Command() {
  const [apps, setApps] = useState<App[]>([]);
  const [uuid] = useState<string>(randomUUID());
  const [command, setCommand] = useState<string>("");
  const [when, setWhen] = useState<string>("");
  const [hotkey, setHotkey] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function saveShortcut(source: string) {
    const shortcut: Shortcut = { uuid, command, when, hotkey };
    if (!isValidShortcut(shortcut)) {
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Saving Shortcut",
    });

    const shortcuts = await $_hotkey_getShortcuts(source);
    formatHotkey(shortcut.hotkey);
    shortcuts.push(shortcut);
    await $_hotkey_setShortcuts(source, shortcuts);

    toast.style = Toast.Style.Success;
    toast.title = "Shortcut Saved";
    popToRoot();
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await $_hotkey_initializeState();
      const data = await $_hotkey_getApps();
      setApps(data);
      setLoading(false);
    };

    init();
  }, []);

  return (
    <Form
      isLoading={loading}
      navigationTitle="Create New Shortcut"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Shortcut"
            onSubmit={async (values) => {
              await saveShortcut(values.source);
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="source" title="Which App">
        {apps.map((app: App) => {
          return <Form.Dropdown.Item title={app.title} value={app.source} icon={app.icon} key={app.source} />;
        })}
      </Form.Dropdown>

      <Form.Separator />

      <Form.TextField
        id="command"
        title="New Command"
        value={command}
        onChange={(value: string) => {
          setCommand(value);
        }}
      />

      <Form.TextField
        id="when"
        title="New When"
        value={when}
        onChange={(value: string) => {
          setWhen(value);
        }}
      />

      <Form.TagPicker
        id="keys"
        title="New Hotkey"
        value={hotkey}
        onChange={(value: string[]) => {
          setHotkey(value);
        }}
      >
        {ModifierKeys.map((modifier) => {
          return <Form.TagPicker.Item value={modifier} title={modifier} key={modifier} />;
        })}
        {Keys.map((key) => {
          return <Form.TagPicker.Item value={key} title={key} key={key} />;
        })}
      </Form.TagPicker>
    </Form>
  );
}
