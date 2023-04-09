import { Action, ActionPanel, Form } from "@raycast/api";
import { App, Shortcut, ShortcutDefault } from "./utils";
import { useEffect, useState } from "react";
import { SupportedApplications } from "./assets/constants";

export default function Command() {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Form
      isLoading={loading}
      navigationTitle="Create New Shortcut"
      actions={
        <ActionPanel>
          <Action title="Save Shortcut" />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="app" title="Which App" defaultValue="system">
        {SupportedApplications.map((app: App) => {
          return <Form.Dropdown.Item title={app.title} value={app.source} icon={app.icon} key={app.source} />;
        })}
      </Form.Dropdown>

      <Form.Separator />

      <Form.TextField id="title" title="Command" />
      <Form.TextField id="when" title="When" />
      <Form.TextField id="hotkey" title="Hotkey" />
    </Form>
  );
}
