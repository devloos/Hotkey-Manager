import { Action, ActionPanel, Form, Toast, popToRoot, showToast } from "@raycast/api";
import { App, Shortcut, getShortcuts, setShortcuts, isValidShortcut, formatHotkey } from "../../utils";
import { useState } from "react";
import { Keys, ModifierKeys } from "../../assets/constants";

interface EditShortcutProps {
  app: App;
  shortcut: Shortcut;
}

export function EditShortcut(props: EditShortcutProps) {
  const { app, shortcut } = props;

  const [uuid] = useState<string>(shortcut.uuid);
  const [command, setCommand] = useState<string>(shortcut.command);
  const [when, setWhen] = useState<string>(shortcut.when);
  const [hotkey, setHotkey] = useState<string[]>(shortcut.hotkey);

  async function saveShortcut() {
    const st: Shortcut = { uuid, command, when, hotkey };
    if (!isValidShortcut(st)) {
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Saving Shortcut",
    });

    const shortcuts = (await getShortcuts(app.source)).filter((el) => el.uuid !== uuid);
    formatHotkey(st.hotkey);
    shortcuts.push(st);
    await setShortcuts(app.source, shortcuts);

    toast.style = Toast.Style.Success;
    toast.title = "Shortcut Saved";
    popToRoot();
  }

  return (
    <Form
      navigationTitle="Edit Shortcut"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Shortcut"
            onSubmit={async () => {
              await saveShortcut();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="app" title="App">
        <Form.Dropdown.Item title={app.title} value={app.source} icon={app.icon} />
      </Form.Dropdown>

      <Form.Separator />

      <Form.TextField
        id="command"
        title="Edit Command"
        value={command}
        onChange={(value: string) => {
          setCommand(value);
        }}
      />

      <Form.TextField
        id="when"
        title="Edit When"
        value={when}
        onChange={(value: string) => {
          setWhen(value);
        }}
      />

      <Form.TagPicker
        id="keys"
        title="Edit Hotkey"
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
    </Form> //
  );
}
