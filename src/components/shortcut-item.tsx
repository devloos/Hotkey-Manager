import { Action, ActionPanel, Alert, Color, List, Toast, confirmAlert, showToast } from "@raycast/api";
import { App, Shortcut, hotkeyToString } from "../utils";
import { $_hotkey_getShortcuts, $_hotkey_setShortcuts } from "../assets/mixins";
import { EditShortcut } from "../views/edit-shortcut";

interface ShortcutItemProps {
  app: App;
  shortcut: Shortcut;
  setShortcuts: (shortcuts: Shortcut[]) => void;
}

export default function ShortcutItem(props: ShortcutItemProps) {
  const { app, shortcut } = props;

  async function deleteShortcut() {
    const options: Alert.Options = {
      title: "Delete Shortcut",
      message: "You will not be able to recover it.",
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    };

    if (!(await confirmAlert(options))) {
      return;
    }

    const shortcuts = (await $_hotkey_getShortcuts(app.source)).filter((el) => el.uuid !== shortcut.uuid);
    await $_hotkey_setShortcuts(app.source, shortcuts);
    props.setShortcuts(shortcuts);
    showToast({
      title: "Shortcut Deleted",
      style: Toast.Style.Success,
    });
  }

  return (
    <List.Item
      title={shortcut.command}
      subtitle={shortcut.when}
      accessories={[{ tag: { color: Color.PrimaryText, value: hotkeyToString(shortcut.hotkey) } }]}
      actions={
        <ActionPanel>
          <ActionPanel.Submenu title="Modify Shortcut">
            <Action.Push
              title="Edit Shortcut"
              shortcut={{ modifiers: ["cmd"], key: "enter" }}
              target={<EditShortcut app={app} shortcut={shortcut} />}
            />
            <Action
              title="Delete Shortcut"
              shortcut={{ modifiers: ["cmd"], key: "backspace" }}
              onAction={async () => {
                await deleteShortcut();
              }}
            />
          </ActionPanel.Submenu>
        </ActionPanel>
      }
    />
  );
}
