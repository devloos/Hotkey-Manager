import { Action, ActionPanel, Alert, Color, List, Toast, confirmAlert, showToast } from "@raycast/api";
import { App, Shortcut, hotkeyToString, AppDefault } from "./utils";
import {
  $_hotkey_getApps,
  $_hotkey_getShortcuts,
  $_hotkey_initializeState,
  $_hotkey_setShortcuts,
} from "./assets/mixins";
import { EditShortcut } from "./views/edit-shortcut";
import { useEffect, useState } from "react";

export default function Command() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [app, setApp] = useState<App>(AppDefault());
  const [loading, setLoading] = useState<boolean>(false);

  async function handleAppChange(src: string) {
    setLoading(true);
    const shortcuts = await $_hotkey_getShortcuts(src);
    setShortcuts(shortcuts);

    const currApp = apps.find((el) => el.source === src);
    if (currApp) {
      setApp(currApp);
    }
    setLoading(false);
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
    <List
      isLoading={loading}
      searchBarAccessory={
        <List.Dropdown tooltip="Apps" onChange={async (source) => handleAppChange(source)}>
          {apps.map((app: App) => {
            return <List.Dropdown.Item title={app.title} value={app.source} icon={app.icon} key={app.source} />;
          })}
        </List.Dropdown>
      }
    >
      {shortcuts.map((shortcut: Shortcut) => {
        return (
          <List.Item
            key={shortcut.command}
            title={shortcut.command}
            subtitle={shortcut.when}
            accessories={[{ tag: { color: Color.PrimaryText, value: hotkeyToString(shortcut.hotkey) } }]}
            actions={
              <ActionPanel>
                <Action
                  title="Run in Active App"
                  onAction={() => {
                    console.log("running");
                  }}
                />
                <Action.Push title="Edit Shortcut" target={<EditShortcut app={app} shortcut={shortcut} />} />
                <Action
                  title="Delete Shortcut"
                  shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                  onAction={async () => {
                    const options: Alert.Options = {
                      title: "Delete Shortcut",
                      message: "You will not be able to recover it.",
                      primaryAction: {
                        title: "Delete",
                        style: Alert.ActionStyle.Destructive,
                      },
                    };

                    if (await confirmAlert(options)) {
                      const newShortcuts = shortcuts.filter((el) => el.uuid !== shortcut.uuid);
                      setShortcuts(newShortcuts);
                      await $_hotkey_setShortcuts(app.source, newShortcuts);
                      showToast({
                        title: "Shortcut Deleted",
                        style: Toast.Style.Success,
                      });
                    }
                  }}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
