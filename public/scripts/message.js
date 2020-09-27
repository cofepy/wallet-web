import extension from "extensionizer";
import store from "./store";
import CONST from "../../src/util/const";
import util from "../../src/util/util";
import querystring from "query-string";
import request from "./request";
import API from "../../src/util/api";

export default class MessageManager {
  constructor(opts) {
    // 存储sign请求，直到用户通过或拒绝
    this.signmsgs = {};
    // 存储balance
    this.balance = new Map();
    //this.port = opts.port;
    this.openPopup = opts.openPopup;
    this.popupIsOpen = opts.popupIsOpen;
    this.setpopupIsOpen = opts.setpopupIsOpen;

    // 启动资产查询loop
    this.get_balance_loop();

    this.port = new Map();
    extension.runtime.onConnect.addListener((port) => {
      if (port.name == "popup") {
        this.popupIsOpen = true;
        this.setpopupIsOpen(this.popupIsOpen);
      }
      this.port.set(
        port.sender.tab ? port.sender.tab.id : port.sender.id,
        port
      );
      port.onMessage.addListener(this.msglistener(port));
      port.onDisconnect.addListener((res) => {
        this.port.delete(res.sender.tab ? res.sender.tab.id : res.sender.id);
        let haspopup = false;
        this.port.forEach((item) => {
          if (item.name == "popup") {
            haspopup = true;
          }
        });
        this.popupIsOpen = haspopup;
        this.setpopupIsOpen(this.popupIsOpen);
      });
    });
  }
  msglistener(port) {
    return (msg) => {
      return this.handleMsg(msg, port);
    };
  }
  /**
   * @param {object} msg
   * @param {string} msg.id
   * @param {string} msg.from [popup, background, page]
   * @param {string} msg.to  [popup, background, page]
   * @param {string} msg.to [popup, background, page]
   * @param {string} msg.tabId 浏览器tab id，如果是发送到page的消息，则发送到=tabid的这个tab，如果没有，读取当前激活的窗口tabid
   * @param {number} msg.time 时间戳
   * @param {string} msg.typs 事件类型：sign签名，connect链接插件，get_account获取账户信息，其他业务以后在增加, set_store, get_store
   * @param {object} data 具体的消息内容
   *
   */
  async handleMsg(msg, port) {
    if (!msg) {
      return;
    }
    if (!this.port.has(port.sender.tab ? port.sender.tab.id : port.sender.id)) {
      return;
    }
    let obj = {};
    try {
      obj = JSON.parse(msg);
    } catch (e) {}
    if (Object.keys(obj).length == 0) {
      return;
    }
    if (obj.to) {
      console.log("background 接收到消息：" + msg);
    }
    // 发送到background
    if (obj.to == CONST.MESSAGE_FROM_BACKGROUND) {
      // 保存数据
      if (
        obj.type == CONST.METHOD_SET_STORE &&
        obj.from == CONST.MESSAGE_FROM_POPUP
      ) {
        store.set(obj.data);
      }
      // 读取数据
      if (
        obj.type == CONST.METHOD_GET_STORE &&
        obj.from == CONST.MESSAGE_FROM_POPU
      ) {
        const data = await store.get();
        this.sendMsgToPopup({ ...obj, data: data }, port);
      }
      // get_account
      if (
        obj.type == CONST.METHOD_GET_ACCOUNT &&
        obj.from == CONST.MESSAGE_FROM_PAGE
      ) {
        this.get_account(obj, port);
      }
      // 页面发送sign请求
      if (
        obj.type == CONST.METHOD_SIGN &&
        obj.from == CONST.MESSAGE_FROM_PAGE
      ) {
        this.sign(obj, port);
      }
      // popup回复sign请求
      if (
        obj.type == CONST.METHOD_SIGN &&
        obj.from == CONST.MESSAGE_FROM_POPUP
      ) {
        this.sign_result(obj, port);
      }
      // 页面发送 connect请求
      if (
        obj.type == CONST.MEHTOD_CONNECT &&
        obj.from == CONST.MESSAGE_FROM_PAGE
      ) {
        this.connect(obj, port);
      }
      // popup回复 connect请求
      if (
        obj.type == CONST.MEHTOD_CONNECT &&
        obj.from == CONST.MESSAGE_FROM_POPUP
      ) {
        this.sendMsgToPage(obj, port);
      }

      // request get_balance
      if (obj.type == CONST.METHOD_GET_BALANCE) {
        this.get_balance(obj, port);
      }
    }
  }

  /**
   * sign,get_account等操作的前置判断
   * @param {object} obj
   * @param {string} type
   * @param {object} port
   * @return {boolean} boolean
   */
  async account_logined(obj, type, port) {
    const datas = await store.get();
    // todo 无账户
    if (datas.accounts.length == 0) {
      this.sendMsgToPage(
        {
          id: obj.id,
          type,
          data: {
            msg: "No account in wallet",
            code: 400,
          },
        },
        port
      );
      return false;
    }
    const orign = port.sender.url || "";
    const sites = datas.sites || [];
    const index = sites.findIndex((item) => orign.indexOf(item) > -1);
    // todo 未链接钱包
    if (
      index == -1 &&
      type !== CONST.MEHTOD_CONNECT &&
      obj.from == CONST.MESSAGE_FROM_PAGE
    ) {
      this.sendMsgToPage(
        {
          id: obj.id,
          type,
          data: {
            msg: "HBC_wallet not connected",
            code: 400,
          },
        },
        port
      );
      return false;
    }

    // todo 未登录
    if (datas.account_index == -1 || !datas.password) {
      this.sendMsgToPage(
        {
          id: obj.id,
          type,
          data: {
            msg: "Not logged in",
            code: 400,
          },
        },
        port
      );
      return false;
    }

    // type == sign , get_balance 地址不在当前账户列表
    const from =
      obj.data && obj.data.msgs && obj.data.msgs[0] && obj.data.msgs[0].value
        ? obj.data.msgs[0].value.from_address
        : "";
    if (
      from &&
      (type == CONST.METHOD_SIGN || type == CONST.METHOD_GET_ACCOUNT)
    ) {
      const index = datas.accounts.findIndex((item) => item.address == from);
      if (index == -1) {
        this.sendMsgToPage(
          {
            id: obj.id,
            type,
            data: {
              msg: `${from} address does not exist`,
              code: 400,
            },
          },
          port
        );
        return false;
      }
    }
    return true;
  }
  /**
   * connect 授权
   * @param {*} obj
   */
  async connect(obj, port) {
    const res = await this.account_logined(obj, CONST.MEHTOD_CONNECT, port);
    if (res) {
      const origin = querystring.parseUrl(port.sender.origin || "").url;
      const datas = await store.get();
      const sites = datas.sites || [];
      const index = sites.findIndex((item) => origin.indexOf(item) > -1);
      console.log(sites, origin);
      // 已授权过
      if (index > -1) {
        this.sendMsgToPage(
          {
            id: obj.id,
            type: obj.type,
            data: {
              code: 200,
              msg: "OK",
            },
          },
          port
        );
      } else {
        this.sendMsgToPopup(
          {
            id: obj.id,
            type: obj.type,
            data: { ...obj.data, tab: port.sender.tab, origin },
          },
          port
        );
      }
    }
  }
  /**
   * get_account 获取账户信息
   * @param {object} obj
   * @param {object} port
   */
  async get_account(obj, port) {
    const res = await this.account_logined(obj, CONST.METHOD_GET_ACCOUNT, port);
    // 返回当前账户地址
    if (res) {
      const datas = await store.get();
      const account =
        datas.account_index > -1 && datas.accounts
          ? datas.accounts[datas.account_index]
          : { address: "" };
      this.sendMsgToPage(
        {
          id: obj.id,
          type: CONST.METHOD_GET_ACCOUNT,
          data: {
            code: 200,
            msg: "OK",
            data: {
              address: account.address,
            },
          },
        },
        port
      );
    }
  }
  /**
   * get_balance
   * @param {object} obj
   * @param {object} port
   */
  async get_balance(obj, port) {
    const res = await this.account_logined(obj, CONST.METHOD_GET_BALANCE, port);
    if (res) {
      const datas = await store.get();
      const account = datas.accounts[datas.account_index];
      const address = account.address;
      const data = this.balance.get(address) || {};
      console.log(port.name);
      // popup and popup is open
      if (port.name == "popup") {
        if (this.popupIsOpen) {
          this.sendMsgToPopup({ ...obj, data }, port);
        }
      } else {
        this.sendMsgToPage({ ...obj, data }, port);
      }
    }
  }
  /**
   * get_balance_loop 后台轮询获取资产
   */
  async get_balance_loop() {
    const datas = await store.get();
    if (datas.accounts.length && datas.account_index > -1 && datas.password) {
      const account = datas.accounts[datas.account_index];
      const address = account.address;
      try {
        const result = await request(API.domain.main + API.cus + "/" + address);
        if (result.code == 200) {
          this.balance.set(address, result.data);
        }
      } catch (e) {}
    }
    await util.delay(2000);
    this.get_balance_loop();
  }
  /**
   * sign to popup 消息发送popup，等待签名
   * @param {*} obj
   */
  async sign(obj, port) {
    const res = await this.account_logined(obj, CONST.METHOD_SIGN, port);
    // 发送消息到popup
    if (res) {
      // 验证数据正确性
      let d = { ...obj.data };
      if (
        !d.chain_id ||
        !d.msgs ||
        !d.msgs[0] ||
        !d.msgs[0].value ||
        !d.msgs[0].value.from_address ||
        !d.msgs[0].value.to_address ||
        !d.msgs[0].value.amount ||
        !d.msgs[0].value.amount[0] ||
        !d.msgs[0].value.amount[0].denom ||
        !d.msgs[0].value.amount[0].amount ||
        !d.fee ||
        !d.fee.gas ||
        !d.fee.amount ||
        !d.fee.amount[0] ||
        !d.fee.amount[0].denom ||
        !d.fee.amount[0].amount
      ) {
        this.sendMsgToPage(
          { ...obj, data: { code: 400, msg: "Missing parameters" } },
          port
        );
        return;
      }
      // 获取sequence
      try {
        const result = await request(
          API.domain.main + API.cus + "/" + obj.data.msgs[0].value.from_address
        );
        if (result.code == 200) {
          obj.data.sequence = result.data.sequence;
          this.signmsgs[obj.id] = obj;
          store.set({ signmsgs: this.signmsgs });
          this.sendMsgToPopup(obj, port);
        } else {
          this.sendMsgToPage(
            { ...obj, data: { code: 400, msg: result.msg } },
            port
          );
        }
      } catch (e) {
        this.sendMsgToPage(
          { ...obj, data: { code: 400, msg: e.message } },
          port
        );
      }
    }
  }
  /**
   * sign result to page 签名结果发送server, 并发消息到page
   * @param {*} obj
   * @param {*} port
   */
  async sign_result(obj, port) {
    if (this.signmsgs && obj.id && this.signmsgs[obj.id]) {
      delete this.signmsgs[obj.id];
    }
    store.set({ signmsgs: this.signmsgs });
    // 用户拒绝
    if (obj.data && obj.data.code == 400) {
      this.sendMsgToPage(obj, port);
      return;
    }
    // 用户确认
    try {
      let d = {
        fee: obj.data.fee,
        memo: obj.data.meno,
        msg: obj.data.msgs,
        signatures: obj.data.signatures,
      };
      const result = await request(API.domain.main + API.txs, {
        body: JSON.stringify({
          tx: d,
          mode: "sync",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      this.sendMsgToPage({ ...obj, data: result }, port);
    } catch (e) {
      this.sendMsgToPage({ ...obj, data: { code: 400, msg: e.message } }, port);
    }
  }
  // 发消息到page
  async sendMsgToPage(obj, port) {
    let msg = util.packmsg({
      from: CONST.MESSAGE_FROM_BACKGROUND,
      to: CONST.MESSAGE_FROM_PAGE,
      id: obj.id || "",
      type: obj.type,
      tabId: obj.tabId,
      data: obj.data,
    });
    console.log("send data to page:");
    console.log(msg);
    this.port.forEach((item) => {
      try {
        item.postMessage(JSON.stringify(msg));
      } catch (e) {}
    });
    return;
  }
  // 发送数据到popup
  async sendMsgToPopup(data, port) {
    if (!this.popupIsOpen) {
      await this.openPopup();
    }
    setTimeout(() => {
      this.port.forEach((item) => {
        try {
          item.postMessage(
            JSON.stringify({
              from: CONST.MESSAGE_FROM_BACKGROUND,
              to: CONST.MESSAGE_FROM_POPUP,
              time: new Date().getTime(),
              type: data.type,
              id: data.id,
              data: data.data,
            })
          );
        } catch (e) {}
      });
    }, 100);
  }
}
