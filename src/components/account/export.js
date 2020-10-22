// 设置
import React from "react";
import styles from "./export.style";
import { withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { Grid, Button, Divider } from "@material-ui/core";
import route_map from "../../config/route_map";
import helper from "../../util/helper";
import { routerRedux } from "dva/router";
import querystring from "query-string";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Iconfont } from "../../lib";
import { CopyToClipboard } from "react-copy-to-clipboard";
import message from "../public/message";

class IndexRC extends React.Component {
  constructor() {
    super();
    this.state = {
      title: {
        seed: "export seed",
        key: "export private key",
        Keystore: "export Keystore",
      },
      seeds: [],
      mnemonic: "",
      copyed: false,
      copytext: "",
    };
  }
  componentDidMount() {
    const params = querystring.parse(this.props.location.search || "");
    const store = this.props.store;
    const account = store.accounts[store.account_index];
    const password = this.props.location.state
      ? this.props.location.state.password
      : "";
    if (params.way == "seed") {
      const mnemonic = helper.aes_decrypt(account["mnemonic"], password) || "";
      this.setState({
        seeds: mnemonic ? mnemonic.split(" ") : [],
        copytext: mnemonic,
      });
    }
    if (params.way == "key") {
      const key = helper.aes_decrypt(account["privateKey"], password) || "";
      this.setState({
        copytext: key,
      });
    }
    if (params.way == "Keystore") {
      this.getKeystore(account, password);
    }
  }
  getKeystore = async (account, password) => {
    const key = helper.aes_decrypt(account["privateKey"], password) || "";
    let keystore = "";
    await helper
      .createKeystore(key, account["address"], password)
      .then((res) => {
        keystore = JSON.stringify(res);
      });
    this.setState({
      copytext: keystore,
    });
  };
  copy = () => {
    this.setState(
      {
        copyed: true,
      },
      () => {
        if (this.state.copyed) {
          message.success(this.props.intl.formatMessage({ id: "copyed" }));
          setTimeout(() => {
            this.setState({
              copyed: false,
            });
          }, 5000);
        }
      }
    );
  };

  render() {
    const { classes, intl, dispatch } = this.props;
    const params = querystring.parse(this.props.location.search || "");
    return (
      <div className={classes.export_list}>
        <Grid
          container
          justify="space-between"
          alignItems="center"
          className={classes.nav}
        >
          <Grid item xs={2} style={{ padding: "0 0 0 16px" }}>
            <ArrowBackIosIcon
              onClick={() => {
                dispatch(routerRedux.goBack());
              }}
            />
          </Grid>
          <Grid item>
            <h2>
              {params.way
                ? intl.formatMessage({ id: this.state.title[params.way] })
                : ""}
            </h2>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
        {params.way == "seed" ? (
          <div className={classes.seed}>
            <h1 className={classes.tit}>
              {intl.formatMessage({ id: "seed.new.title" })}
            </h1>
            <p className={classes.desc}>
              {intl.formatMessage({ id: "seed.new.desc1" })}
            </p>
            <Grid container spacing={1}>
              {this.state.seeds.map((item, i) => {
                return (
                  <Grid item xs={4} key={i}>
                    <div className={classes.seed_item}>
                      <em>{i + 1}</em>
                      <p>{item}</p>
                    </div>
                  </Grid>
                );
              })}
            </Grid>
          </div>
        ) : (
          ""
        )}
        {params.way == "key" ? (
          <div className={classes.export}>
            <p className={classes.desc}>
              {intl.formatMessage({ id: "export.key.desc" })}
            </p>
            <div className={classes.con}>{this.state.copytext}</div>
          </div>
        ) : (
          ""
        )}
        {params.way == "Keystore" ? (
          <div className={classes.export}>
            <p className={classes.desc}>
              {intl.formatMessage({ id: "export.key.desc" })}
            </p>
            <div className={classes.con}>{this.state.copytext}</div>
          </div>
        ) : (
          ""
        )}
        <div style={{ padding: "0 16px 16px" }}>
          <div className={classes.whole}>
            <CopyToClipboard text={this.state.copytext} onCopy={this.copy}>
              <div className={classes.half}>
                <Iconfont type="copy" size={20} />
                <span>{intl.formatMessage({ id: "copy" })}</span>
              </div>
            </CopyToClipboard>
            <Divider orientation="vertical" flexItem />
            <div className={classes.half}>
              <Iconfont type="QRcode" size={20} />
              <span>{intl.formatMessage({ id: "qrcode" })}</span>
            </div>
          </div>
          <Button
            onClick={() => {
              this.props.dispatch(
                routerRedux.push({
                  pathname: route_map.index,
                })
              );
            }}
            fullWidth
            color="primary"
            variant="contained"
            className={classes.button}
          >
            {this.props.intl.formatMessage({
              id: "backups",
            })}
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(injectIntl(IndexRC));
