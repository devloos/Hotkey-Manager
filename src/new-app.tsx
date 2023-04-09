import { Action, ActionPanel, Form, Toast, popToRoot, showToast } from "@raycast/api";
import { useState } from "react";
import { SupportedLogos } from "./assets/constants";
import { App, getApps, setApps } from "./utils";

export default function Command() {
  const [appName, setAppName] = useState<string>("");
  const [logoSource, setLogoSource] = useState<string>("");

  async function saveApp() {
    if (appName.length === 0) {
      showToast({
        title: "App name empty",
        style: Toast.Style.Failure,
      });
      return;
    }

    const apps = await getApps();
    if (apps.some((el) => el.source === appName.toLowerCase())) {
      showToast({
        title: "Already existing source",
        style: Toast.Style.Failure,
      });
      return;
    }

    const logo = SupportedLogos.find((el) => el.source === logoSource);
    if (!logo) {
      showToast({
        title: "ERROR: logo not found.",
        style: Toast.Style.Failure,
      });
      popToRoot();
      return;
    }

    const toast = await showToast({
      title: "Saving App",
      style: Toast.Style.Animated,
    });

    const app: App = { title: appName, source: appName.toLowerCase(), icon: logo.path };
    apps.push(app);
    await setApps(apps);

    toast.style = Toast.Style.Success;
    toast.title = "App Saved";
    popToRoot();
  }

  return (
    <Form
      navigationTitle="Create New App"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save App"
            onSubmit={async () => {
              await saveApp();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="app-name" title="App Name" value={appName} onChange={setAppName} />
      <Form.Description title="Source" text={appName.toLowerCase()} />
      <Form.Dropdown id="logo" onChange={setLogoSource}>
        {SupportedLogos.map((logo) => {
          return <Form.Dropdown.Item title={logo.title} value={logo.source} icon={logo.path} key={logo.source} />;
        })}
      </Form.Dropdown>
    </Form>
  );
}
