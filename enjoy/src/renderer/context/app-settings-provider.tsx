import { createContext, useEffect, useState, useRef } from "react";
import { toast } from "@renderer/components/ui";
import { WEB_API_URL } from "@/constants";
import { Client } from "@/api";
import i18n from "@renderer/i18n";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

type AppSettingsProviderState = {
  webApi: Client;
  apiUrl?: string;
  user: UserType | null;
  initialized: boolean;
  version?: string;
  libraryPath?: string;
  login?: (user: UserType) => void;
  logout?: () => void;
  setLibraryPath?: (path: string) => Promise<void>;
  ffmpegConfig?: FfmpegConfigType;
  ffmpeg?: FFmpeg;
  setFfmegConfig?: (config: FfmpegConfigType) => void;
  EnjoyApp?: EnjoyAppType;
  language?: "en" | "zh-CN";
  switchLanguage?: (language: "en" | "zh-CN") => void;
  proxy?: ProxyConfigType;
  setProxy?: (config: ProxyConfigType) => Promise<void>;
};

const initialState: AppSettingsProviderState = {
  webApi: null,
  user: null,
  initialized: false,
};

export const AppSettingsProviderContext =
  createContext<AppSettingsProviderState>(initialState);

export const AppSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [version, setVersion] = useState<string>("");
  const [apiUrl, setApiUrl] = useState<string>(WEB_API_URL);
  const [webApi, setWebApi] = useState<Client>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [libraryPath, setLibraryPath] = useState("");
  const [ffmpegConfig, setFfmegConfig] = useState<FfmpegConfigType>(null);
  const [ffmpeg, setFfmpeg] = useState<FFmpeg>(null);
  const [language, setLanguage] = useState<"en" | "zh-CN">();
  const [proxy, setProxy] = useState<ProxyConfigType>();
  const EnjoyApp = window.__ENJOY_APP__;

  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    fetchVersion();
    fetchUser();
    fetchLibraryPath();
    fetchFfmpegConfig();
    fetchLanguage();
    loadFfmpegWASM();
    fetchProxyConfig();
  }, []);

  useEffect(() => {
    validate();
  }, [user, libraryPath]);

  useEffect(() => {
    if (!apiUrl) return;

    setWebApi(
      new Client({
        baseUrl: apiUrl,
        accessToken: user?.accessToken,
        locale: language,
      })
    );
  }, [user, apiUrl, language]);

  const loadFfmpegWASM = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    ffmpegRef.current.on("log", ({ message }) => {
      console.log(message);
    });

    const coreURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.js`,
      "text/javascript"
    );
    const wasmURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm"
    );
    const workerURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    );

    try {
      await ffmpegRef.current.load({
        coreURL,
        wasmURL,
        workerURL,
      });
      setFfmpeg(ffmpegRef.current);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchLanguage = async () => {
    const language = await EnjoyApp.settings.getLanguage();
    setLanguage(language as "en" | "zh-CN");
    i18n.changeLanguage(language);
  };

  const switchLanguage = (language: "en" | "zh-CN") => {
    EnjoyApp.settings.switchLanguage(language).then(() => {
      i18n.changeLanguage(language);
      setLanguage(language);
    });
  };

  const fetchFfmpegConfig = async () => {
    const config = await EnjoyApp.ffmpeg.config();
    setFfmegConfig(config);
  };

  const fetchVersion = async () => {
    const version = EnjoyApp.app.version;
    setVersion(version);
  };

  const fetchUser = async () => {
    const apiUrl = await EnjoyApp.app.apiUrl();
    setApiUrl(apiUrl);

    const currentUser = await EnjoyApp.settings.getUser();
    if (!currentUser) return;

    const client = new Client({
      baseUrl: apiUrl,
      accessToken: currentUser.accessToken,
    });

    client.me().then((user) => {
      if (user?.id) {
        login(currentUser);
      } else {
        logout();
      }
    });
  };

  const login = (user: UserType) => {
    setUser(user);
    EnjoyApp.settings.setUser(user);
  };

  const logout = () => {
    setUser(null);
    EnjoyApp.settings.setUser(null);
  };

  const fetchLibraryPath = async () => {
    const dir = await EnjoyApp.settings.getLibrary();
    setLibraryPath(dir);
  };

  const setLibraryPathHandler = async (dir: string) => {
    await EnjoyApp.settings.setLibrary(dir);
    setLibraryPath(dir);
  };

  const fetchProxyConfig = async () => {
    const config = await EnjoyApp.system.proxy.get();
    setProxy(config);
  };

  const setProxyConfigHandler = async (config: ProxyConfigType) => {
    EnjoyApp.system.proxy.set(config).then(() => {
      setProxy(config);
    });
  };

  const validate = async () => {
    setInitialized(Boolean(user && libraryPath));
  };

  return (
    <AppSettingsProviderContext.Provider
      value={{
        language,
        switchLanguage,
        EnjoyApp,
        version,
        webApi,
        apiUrl,
        user,
        login,
        logout,
        libraryPath,
        setLibraryPath: setLibraryPathHandler,
        ffmpegConfig,
        ffmpeg,
        setFfmegConfig,
        proxy,
        setProxy: setProxyConfigHandler,
        initialized,
      }}
    >
      {children}
    </AppSettingsProviderContext.Provider>
  );
};
