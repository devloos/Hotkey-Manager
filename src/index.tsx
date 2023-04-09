import { Action, ActionPanel, Alert, Color, List, Toast, confirmAlert, showToast } from "@raycast/api";
import { App, Shortcut, getShortcuts, getApps, setShortcuts, hotkeyToString, AppDefault } from "./utils";
import { useEffect, useState } from "react";
import { EditShortcut } from "./views/edit-shortcut";

export default function Command() {
  const [appShortcuts, setAppShortcuts] = useState<Shortcut[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [app, setApp] = useState<App>(AppDefault());
  const [loading, setLoading] = useState<boolean>(false);

  async function handleAppChange(src: string) {
    setLoading(true);
    const appShortcuts = await getShortcuts(src);
    setAppShortcuts(appShortcuts);

    const currApp = apps.find((el) => el.source === src);
    if (currApp) {
      setApp(currApp);
    }
    setLoading(false);
  }

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      const data = await getApps();
      setApps(data);
      setLoading(false);
    };

    fetchApps();
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
      {appShortcuts.map((shortcut: Shortcut) => {
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
                      const newShortcuts = appShortcuts.filter((el) => el.uuid !== shortcut.uuid);
                      setAppShortcuts(newShortcuts);
                      await setShortcuts(app.source, newShortcuts);
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
