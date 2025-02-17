import { t } from "i18next";
import { Button, ScrollArea, Separator } from "@renderer/components/ui";
import {
  About,
  DefaultEngineSettings,
  Hotkeys,
  UserSettings,
  BalanceSettings,
  LanguageSettings,
  LibrarySettings,
  WhisperSettings,
  FfmpegSettings,
  OpenaiSettings,
  ProxySettings,
  GoogleGenerativeAiSettings,
  ResetSettings,
  ResetAllSettings,
} from "@renderer/components";
import { useState, useContext } from "react";
import { AppSettingsProviderContext } from "@renderer/context";
import { Tooltip } from "react-tooltip";

export const Preferences = () => {
  const { ffmpegConfig } = useContext(AppSettingsProviderContext);

  const TABS = [
    {
      value: "basic",
      label: t("basicSettingsShort"),
      component: () => (
        <div className="">
          <div className="font-semibold mb-4 capitilized">
            {t("basicSettings")}
          </div>
          <LibrarySettings />
          <Separator />
          <WhisperSettings />
          <Separator />
          <DefaultEngineSettings />
          <Separator />
          <OpenaiSettings />
          <Separator />
          <GoogleGenerativeAiSettings />
          <Separator />
          {ffmpegConfig.ready && (
            <>
              <FfmpegSettings />
              <Separator />
            </>
          )}
        </div>
      ),
    },
    {
      value: "advanced",
      label: t("advancedSettingsShort"),
      component: () => (
        <>
          <div className="font-semibold mb-4 capitilized">
            {t("advancedSettings")}
          </div>
          <ProxySettings />
          <Separator />
          <ResetSettings />
          <Separator />
          <ResetAllSettings />
          <Separator />
        </>
      ),
    },
    {
      value: "account",
      label: t("accountSettingsShort"),
      component: () => (
        <div className="">
          <div className="font-semibold mb-4 capitilized">
            {t("accountSettings")}
          </div>
          <UserSettings />
          <Separator />
          <BalanceSettings />
          <Separator />
          <LanguageSettings />
          <Separator />
        </div>
      ),
    },
    {
      value: "hotkeys",
      label: t("hotkeys"),
      component: () => <Hotkeys />,
    },
    {
      value: "about",
      label: t("about"),
      component: () => <About />,
    },
  ];

  const [activeTab, setActiveTab] = useState<string>("basic");

  return (
    <>
      <div className="grid grid-cols-5 overflow-hidden h-full">
        <ScrollArea className="h-full col-span-1 bg-muted/50 p-4">
          <div className="py-2 text-muted-foreground mb-4">
            {t("sidebar.preferences")}
          </div>

          {TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "ghost"}
              size="sm"
              className={`capitilized w-full justify-start mb-2 ${
                activeTab === tab.value ? "" : "hover:bg-muted"
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              <span className="text-sm">{tab.label}</span>
            </Button>
          ))}
        </ScrollArea>
        <ScrollArea className="h-full col-span-4 py-6 px-10">
          {TABS.find((tab) => tab.value === activeTab)?.component()}
        </ScrollArea>
      </div>
      <Tooltip id="preferences-tooltip" />
    </>
  );
};
