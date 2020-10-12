const local = ""; // :lang or '' 多语言是否配置在路径中

export default {
  // 未登录，允许访问的地址
  noLogin: [
    "login",
    "welcome",
    "create_account_step1",
    "create_account_step2",
    "create_account_step3",
  ],

  // login
  login: `${local}/login`,
  // 首页
  index: `${local}/`,
  // 欢迎页
  welcome: `${local}/welcome`,
  create_account_step1: `${local}/create_account_step1`,
  create_account_step2: `${local}/create_account_step2`,
  create_account_step3: `${local}/create_account_step3`,
  account_seed: `${local}/account_seed`,
  create_account_done: `${local}/create_account_done`,
  sign: `${local}/sign`,
  connect: `${local}/connect`,
  chain: `${local}/chain`,
  symbol: `${local}/symbol`,
  transfer: `${local}/transfer`,
  external_address: `${local}/external_address`,
};
