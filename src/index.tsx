import { $_hotkey_getApps, $_hotkey_getShortcuts, $_hotkey_initializeState } from "./assets/mixins";
import { App, Shortcut, AppDefault } from "./utils";
import { Action, ActionPanel, List } from "@raycast/api";
import { useEffect, useState } from "react";
import ShortcutItem from "./components/shortcut-item";
import NewShortcut from "./new-shortcut";
import NewApp from "./new-app";

export default function ListHotkeys() {
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
      actions={
        <ActionPanel>
          <Action.Push title="Create New Shortcut" target={<NewShortcut />} />
          <Action.Push title="Create New App" target={<NewApp />} />
        </ActionPanel>
      }
    >
      {shortcuts.map((shortcut: Shortcut) => {
        return <ShortcutItem app={app} shortcut={shortcut} key={shortcut.uuid} setShortcuts={setShortcuts} />;
      })}
    </List>
  );
}
