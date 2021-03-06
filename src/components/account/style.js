import helper from "../../util/helper";
export default (theme) => ({
  login: {
    // width: 300,
    margin: "0 auto",
    textAlign: "center",
    padding: "50px 16px 0",
    "& img": {
      width: 80,
      height: 80,
      borderRadius: 16,
      margin: "0 0 16px",
    },
    "& h1": {
      color: theme.palette.grey[700],
      fontSize: 24,
      lineHeight: "36px",
      margin: "16px 0",
      fontWeight: "bold",
    },
    "& p": {
      color: theme.palette.grey[500],
      fontSize: 16,
    },
    "& .Mui-error": {
      marginLeft: 0,
    },
  },
  login_form: {
    margin: "56px 0 0",
  },
  connect: {
    width: 350,
    margin: "0 auto",
    textAlign: "center",
    padding: "50px 0 0",
    position: "relative",
    minHeight: 550,
    "& img": {
      maxWidth: 80,
      maxHeight: 80,
      margin: "0 0 10px",
    },
    "& p": {
      color: theme.palette.grey[500],
    },
    "& h1": {
      margin: "20px 0 10px",
    },
  },
  connect_btns: {
    margin: "100px 0 0",
    position: "absolute",
    bottom: 10,
  },
  btn_large: {
    padding: "15px 50px",
  },
  button: {
    ...theme.typography.button,
    "&.Mui-disabled": {
      color: theme.palette.common.white,
      background: theme.palette.grey[100],
    },
  },
  sign: {
    width: 350,
    margin: "0 auto",
  },
  network: {
    padding: "4px 0 0",
    "& span": {
      display: "flex",
      padding: "0px 4px",
      alignItems: "center",
      borderRadius: 4,
      background: helper.hex_to_rgba(theme.palette.success.light, 0.3),
    },
    "& svg": {
      color: theme.palette.success.main,
      width: 14,
      height: 14,
      margin: "0 5px 0 0",
    },
  },
  address: {
    padding: 6,
    borderTop: `1px solid ${theme.palette.grey[100]}`,
    borderBottom: `1px solid ${theme.palette.grey[100]}`,
    "& em": {
      width: "100%",
      display: "block",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
  },
  acount: {
    padding: 20,
    background: theme.palette.grey[50],
    textAlign: "right",
    "& h1": {
      fontSize: 18,
      margin: "10px 0",
    },
    "& span": {
      fontSize: 12,
    },
  },
  detail: {
    margin: "0 0 10px",
    "& em": {
      color: theme.palette.grey[800],
      fontSize: 16,
    },
    "& strong": {
      fontSize: 20,
      display: "block",
    },
  },
  item: {
    padding: "15px 10px",
    borderBottom: `1px solid ${theme.palette.grey[100]}`,
    fontSize: 14,
  },
  item_content: {
    wordBreak: "break-all",
    textAlign: "right",
  },
  login_mnemonic: {
    margin: "50px 0 0",
    color: theme.palette.secondary.main,
    cursor: "pointer",
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    textAlign: "left",
  },
  sign_title: {
    textAlign: "center",
    padding: "16px 10px",
    fontSize: 20,
  },
  back: {
    height: 44,
    // maxWidth: 375,
    margin: "0 auto",
    "& h2": {
      fontSize: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  back2: {
    color: theme.palette.common.white,
  },
  accept: {
    minHeight: "100vh",
  },
  accept_by_type_hbc: {
    background: theme.palette.primary.main,
  },
  accept_by_type_chain_in: {
    background: "#269A99",
    "& i": {
      background: "#269A99 !important",
    },
  },
  accept_by_type_: {
    background: theme.palette.grey[700],
    "& i": {
      background: `${theme.palette.grey[700]} !important`,
    },
  },
  tip: {
    color: helper.hex_to_rgba(theme.palette.common.white, 0.45),
    margin: "40px auto 0",
    // maxWidth: 375,
    padding: "0 0 20px",
    lineHeight: "20px",
    fontSize: 12,
    "& dt": {
      textAlign: "center",
    },
  },
  accept_content: {
    // height: "calc(100vh - 44px)",
    background: theme.palette.primary.main,
    position: "relative",
    padding: 24,
    "& h3": {
      margin: "-42px -24px 42px",
      background: helper.hex_to_rgba(theme.palette.secondary.main, 0.2),
      color: theme.palette.secondary.main,
      fontSize: 14,
      lineHeight: 1.5,
      padding: "4px 48px",
    },
    "& h2": {
      fontSize: 12,
      color: theme.palette.grey[500],
    },
    "& p": {
      color: theme.palette.common.white,
      textAlign: "center",
      fontSize: 12,
      padding: "8px 20px",
      margin: "0 0 24px",
    },
    "& div": {
      padding: "40px 0 0",
      textAlign: "center",
      position: "relative",
      // maxWidth: 375,
      margin: "0 auto",
    },
    "& img": {
      width: 240,
      display: "block",
      margin: "0 auto",
    },
    "& img.token_logo": {
      width: 56,
      height: 56,
      border: "2px solid #fff",
      borderRadius: 28,
      position: "absolute",
      left: "50%",
      top: -26,
      margin: "0 0 0 -28px",
    },
    "& img.token_logo_small": {
      width: 22,
      height: 22,
      borderRadius: 11,
      position: "absolute",
      left: "50%",
      top: 6,
      margin: "0 0 0 6px",
    },
    "& strong": {
      fontSize: 12,
      color: theme.palette.grey[700],
      display: "block",
      textAlign: "center",
      padding: "0 0 24px",
      borderBottom: `1px dashed ${theme.palette.grey[300]}`,
    },
    "& span": {
      display: "flex",
      width: "100%",
      height: 72,
      justifyContent: "center",
      alignItems: "center",
      fontSize: 16,
      color: theme.palette.primary.main,
      cursor: "pointer",
    },
    "& i": {
      display: "block",
      width: 16,
      height: 16,
      background: theme.palette.primary.main,
      position: "absolute",
      borderRadius: 8,
      bottom: 65,
      "&:nth-child(2n)": {
        right: -8,
      },
      "&:nth-child(2n+1)": {
        left: -8,
      },
    },
  },
  input_root: {
    height: 48,
    background: theme.palette.grey[50],
    borderRadius: 4,
    marginTop: "0 !important",
    "&::before, &::after": {
      display: "none",
    },
    "& input": {
      height: 24,
      padding: "12px 10px",
      color: theme.palette.grey[900],
      fontSize: 20,
      "&::placeholder": {
        opacity: 1,
        color: theme.palette.grey[500],
        fontSize: 14,
      },
    },
    "& fieldset": {
      borderColor: "transparent",
      borderWidth: "1px !important",
    },
  },
  accept_content_type: {
    //height: "calc(100vh - 44px)",
    background: "none",
    padding: "42px 24px 24px",
  },
});
