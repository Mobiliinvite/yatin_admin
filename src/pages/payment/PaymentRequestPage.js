import React from "react";
import { useParams } from "react-router-dom";
import styles from "./PaymentStyles.css";

const initialCCDetails = {
  card_number: "",
  card: "",
  card_security_code: "",
  card_holder: "",
};

function getFieldName(path) {
  const list = path.split("/");
  var name = list[list.length - 1];
  if (["card", "expiry_month", "expiry_year"].includes(name)) {
    name = "card";
  }
  return name;
}

const PaymentRequestPage = (props) => {
  const {} = props;
  const [ccerrors] = React.useState(initialCCDetails);
  const [CVV, setCvv] = React.useState(false);
  const [openEdgeResponse, setOpenEdgeResponse] = React.useState({});
  const [cardholderName, setCardholderName] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState(null);
  const [expiary, setExpiary] = React.useState(null);

  const _onChangeCardholderName = (event) => {
    setCardholderName(event.target.value);
  };

  const _handleMessage = (message) => {
    console.log("message-----", message);
    // alert(JSON.stringify(message));
    // const _data = JSON.parse(message);
    setCardNumber(message?.cardNumber);
    setExpiary(message?.expiary);
    // alert(message);
  }

  React.useEffect(()=>{
    window.addEventListener("message", message => {
      console.log(message.data) // Wayne is coming!!!
      // alert(JSON.stringify(message.data, ["message", "arguments", "type", "name"]));
    });
  },[]);

  React.useEffect(() => {
    window.GlobalPayments.configure({
      "X-GP-Api-Key": "QwAnDGYZlLNAl6xo9WTZLLMHACbETHqV",
      "X-GP-Environment": "test",
      "enableAutocomplete": true
    });
    window.GlobalPayments.on("error", (error) => {});
  }, []);

  React.useEffect(() => {
    if (openEdgeResponse.status) {
      if (!CVV) {
        checkNonEmpty("card_security_code", "Invalid CVV");
      } else if(!cardholderName){
        checkNonEmpty("card_holder", "Name Required");
      }else {
        const data = { cardholderName, openEdgeResponse };
        console.log(JSON.stringify(openEdgeResponse));
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }
  }, [openEdgeResponse]);

  React.useEffect(() => {
    const cardForm = window.GlobalPayments.ui.form({
      fields: {
        "card-number": {
          target: "#card-number",
          placeholder: "**** **** **** ****",
          value: cardNumber
        },
        "card-expiration": {
          target: "#card-expiration",
          placeholder: "MM / YYYY",
          value: expiary
        },
        "card-cvv": {
          target: "#card-cvv",
          placeholder: "****",
        },
        submit: {
          target: "#submit",
          text: "Save",
          button: {
            background: "#173654",
            width: "100%",
            "max-width": "349px",
            height: "48px",
            "border-radius": "50px",
            color: "#FFF",
            border: "0px",
            padding: "10px 40px",
            "font-size": "1.125rem",
            margin: "20px auto 40px auto !important",
          },
        },
      },
      styles: {
        button: {
          background: "#173654",
          width: "100%",
          "max-width": "349px",
          height: "48px",
          "border-radius": "50px",
          color: "#FFF",
          border: "0px",
          padding: "10px 40px",
          "font-size": "1.125rem",
          margin: "20px auto 40px auto !important",
          cursor: "pointer",
        },
        input: {
          border: "1px",
          width: "100% !important",
          "max-width": "200px",
          padding: "15px 20px 0px 20px",
          position: "relative",
          bottom: "9px",
          background: "#FFF",
        },
        "input:focus": {
          border: "0px",
          outline: "none",
        },
      },
    });

    cardForm.on("token-success", (resp) => {
      setOpenEdgeResponse({ status: true, resp, flag: 1 });
    });

    cardForm.on("token-error", (resp) => {
      console.log("toekn-error--", JSON.stringify(resp));
      var name =
        resp?.error?.detail && getFieldName(resp?.error?.detail[0]?.data_path);
      if (resp?.error?.message.match(/card\_number/gi)) {
        name = "card_number";
        checkNonEmpty(name, "Invalid Card");
      } else {
        checkNonEmpty(name, resp.error.message);
      }
    });

    cardForm.on("card-number-test", (resp) => {
      document.getElementById("card_number").style.display = "none";
    });
    cardForm.on("card-expiration-test", (resp) => {
      document.getElementById("card").style.display = "none";
    });

    cardForm.on("card-cvv-test", (resp) => {
      if (resp.valid) {
        checkNonEmpty("card_security_code", "");
        setCvv(resp.valid);
      }
    });
  }, []);

  const checkNonEmpty = (name, message) => {
    Object.keys(ccerrors).map((item) => {
      if (item === name) {
        document.getElementById(item).style.display = "block";
        document.getElementById(item).textContent = message;
      } else {
        document.getElementById(item).style.display = "none";
      }
    });
  };

  return (
    <div className="form-contaienr">
      <div className={`form-group`} style={{textAlign: 'left'}}>
        <label>Card Holdername</label>
        <div>
          <input
            id="card-holder-name"
            name="card-holder-name"
            placeholder="Card HolderName"
            onChange={_onChangeCardholderName}
            value={cardholderName}
          />
        </div>
        <span id="card_holder" className={`error`}></span>
      </div>
      <div className={`form-group`}>
        <label>Card Number</label>
        <div id="card-number"></div>
        <span id="card_number" className={`error`}></span>
      </div>
      <div className={`form-group`}>
        <label>Exp. Date</label>
        <div className={`${styles.input_section}`}>
          <div
            id="card-expiration"
            className={`${styles.card_expiration}`}
          ></div>
        </div>
      </div>
      <span id="card" className={`error`}></span>
      <div className={`form-group`}>
        <label>CVV</label>
        <div id="card-cvv" className={`${styles.card_cvv}`}></div>
        <span id="card_security_code" className={`error`}></span>
      </div>
      <div id="submit"></div>
    </div>
  );
};

export default PaymentRequestPage;
