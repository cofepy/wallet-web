import StoreCenter from "./scripts/store";
import extension from "extensionizer";
import MessageManager from "./scripts/message";
import ExtensionPlatform from "./scripts/extension";
import NotificationManager from "./scripts/notification-manager";

const openTabsIDs = {};
let popupIsOpen = false;
let notificationIsOpen = false;
const notificationManager = new NotificationManager();
const platform = new ExtensionPlatform();

async function triggerUi() {
  const tabs = await platform.getActiveTabs();
  const currentlyActiveTab = Boolean(tabs.find((tab) => openTabsIDs[tab.id]));
  if (!popupIsOpen && !currentlyActiveTab) {
    await notificationManager.showPopup();
  }
}

/**
 * Opens the browser popup for user confirmation of watchAsset
 * then it waits until user interact with the UI
 */
async function openPopup() {
  await triggerUi();
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!notificationIsOpen) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
}

// 接收popup的消息
let ports = new Map();
const messages = new MessageManager({
  openPopup,
  popupIsOpen,
});
extension.runtime.onConnect.addListener((port) => {
  popupIsOpen = false;
  ports.set(port.sender.tab.id, port);
  console.log(ports);
  messages.update("port", ports);
  messages.update("popupIsOpen", popupIsOpen);
  port.onDisconnect.addListener(() => {
    //messages.update("port", null);
    ports.clear(port.sender.tab.id);
  });
});

// On first install, open a new tab with
extension.runtime.onInstalled.addListener(({ reason }) => {
  if (
    reason === "install" &&
    !(process.env.METAMASK_DEBUG || process.env.IN_TEST)
  ) {
    platform.openExtensionInBrowser("/welcome");
  }
});

window.store = StoreCenter;
window.platform = platform;
