import { Action, ActionPanel, Alert, Form, Toast, confirmAlert, popToRoot, showToast } from "@raycast/api";
import { App, Shortcut, isValidShortcut, hasHotkeyConflicts } from "../utils";
import { $_SM_getApps } from "../assets/mixins";
import { Keys, ModifierKeys } from "../assets/constants";
import { useEffect, useState } from "react";

interface ShortcutFormProps {
  shortcut: Shortcut;
  source: string;
  navigationTitle: string;
  saveShortcut: (shortcut: Shortcut, source: string) => Promise<void>;
}

export function ShortcutForm(props: ShortcutFormProps) {
  const { shortcut } = props;

  const [apps, setApps] = useState<App[]>([]);
  const [source, setSource] = useState<string>(props.source);
  const [uuid] = useState<string>(shortcut.uuid);
  const [command, setCommand] = useState<string>(shortcut.command);
  const [when, setWhen] = useState<string>(shortcut.when);
  const [hotkey, setHotkey] = useState<string[]>(shortcut.hotkey);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit() {
    if (!isValidShortcut({ uuid, command, when, hotkey })) {
      return;
    }

    const hasDuplicates = await hasHotkeyConflicts(uuid, hotkey, source);
    if (hasDuplicates) {
      const options: Alert.Options = {
        title: "Duplicate Hotkeys!",
        message: "Do you wish to continue?",
        primaryAction: {
          title: "Continue",
          style: Alert.ActionStyle.Default,
        },
      };

      if (!(await confirmAlert(options))) {
        return;
      }
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Saving Shortcut",
    });

    await props.saveShortcut({ uuid, command, when, hotkey }, source);

    toast.style = Toast.Style.Success;
    toast.title = "Shortcut Saved";
    popToRoot();
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = await $_SM_getApps();
      setApps(data);
      setLoading(false);
    };

    init();
  }, []);

  return (
    <Form
      isLoading={loading}
      navigationTitle={props.navigationTitle}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save Shortcut"
            onSubmit={async () => {
              await handleSubmit();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="app" title="App" value={apps.length > 0 ? source : ""} onChange={setSource}>
        {apps.map((app: App) => {
          return <Form.Dropdown.Item title={app.title} value={app.source} icon={app.icon} key={app.source} />;
        })}
      </Form.Dropdown>

      <Form.Separator />

      <Form.TextField
        id="command"
        title="Command"
        value={command}
        onChange={(value: string) => {
          setCommand(value);
        }}
      />

      <Form.TextField
        id="when"
        title="When Clause"
        value={when}
        onChange={(value: string) => {
          setWhen(value);
        }}
      />

      <Form.TagPicker
        id="keys"
        title="Hotkey"
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
