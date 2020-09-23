import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import dva from "dva";
import { IntlProvider, addLocaleData } from "react-intl";
import { createHashHistory } from "history";
import createLoading from "dva-loading";

import Store from "./util/store";
// models
import Layout from "./models/layout";
// routes
import Routes from "./router";

async function getLocale(lang, cb) {
  let result = {};
  switch (lang) {
    case "zh-cn":
      result = await import("./locales/zh-cn");
      break;
    case "en-us":
      result = await import("./locales/en-us");
      break;
    // case "ja-jp":
    //   result = await import("./locales/ja-jp");
    //   break;
    // case "ru-ru":
    //   result = await import("./locales/ru-ru");
    //   break;
    // case "ko-kr":
    //   result = await import("./locales/ko-kr");
    //   break;
    // case "es":
    //   result = await import("./locales/es-es");
    //   break;
    default:
      result = await import("./locales/en-us");
  }
  setTimeout(() => {
    cb(result.default || result);
  }, 0);
}
function browserLang() {
  var ls = navigator.languages ? navigator.languages.length : 0;
  var res = (ls
    ? navigator.languages[0]
    : navigator.language || navigator.userLanguage
  ).toLowerCase();
  return res;
}

function start(initstore) {
  // 1. Initialize
  const data = {
    initialState: initstore,
    history: createHashHistory(),
    //onAction: createLogger(),
    onError(e) {
      window.console.log(e);
    },
  };
  const app = dva(data);

  // 2. Plugins
  app.use(createLoading());

  // 3. Model
  app.model(Layout);

  // 4. Router
  app.router(Routes);

  // 5. Start
  const App = app.start();

  getLocale(browserLang(), function (appLocale) {
    addLocaleData(...appLocale.data);
    ReactDOM.render(
      <IntlProvider
        locale={appLocale.locale}
        messages={appLocale.messages}
        formats={appLocale.formats}
      >
        <App />
      </IntlProvider>,
      document.querySelector("#root")
    );
  });
}
const initStore = async () => {
  const res = await Store.get();
  console.log(res);
  start({
    layout: {
      store: res || {
        accounts: [],
        account_index: -1,
        sites: [],
        signmsgs: {},
        password: "",
      },
    },
  });
};

initStore();
