const PASSWORD_LOWER_CASE = "abcdefghijkmnpqrstuvwxyz"; // without: ['l', 'o']
const PASSWORD_UPPER_CASE = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // without: ['I', 'O']
const PASSWORD_NUMBERS = "123456789"; // without: ['0']
const SYMBOLS = "!@#$%^&*()_+-=[]{}'"; // without: ['|']

class Form {
  constructor(nodeID, initial) {
    this._form = document.forms[nodeID];
    this._initial = initial;

    this.setInitial(this._initial);
  }

  setInitial(initial) {
    for (const [key, value] of Object.entries(initial)) {
      const node = this._form.elements[key];

      this.isCheckbox(node)
        ? this.setCheckboxValue(node, value)
        : this.setTextValue(node, value);
    }
  }

  reset() {
    this.setInitial(this._initial);
  }

  setTextValue(node, value) {
    node.value = value;
  }

  getTextValue(node) {
    return node.value;
  }

  setCheckboxValue(node, value) {
    node.checked = value;
  }

  getCheckboxValue(node) {
    return node.checked;
  }

  isCheckbox(node) {
    return node.type.toLowerCase() === "checkbox";
  }

  isButton(node) {
    return node.tagName.toLowerCase() === "button";
  }

  onSubmitHandler(callback) {
    this._listener = (e) => {
      e.preventDefault();
      const elements = this._form.elements;
      const results = {};

      for (const field of elements) {
        if (!this.isButton(field)) {
          results[field.id] = this.isCheckbox(field)
            ? this.getCheckboxValue(field)
            : this.getTextValue(field);
        }
      }

      if (callback && typeof callback === "function") callback(results);
    };

    this._form.addEventListener("submit", this._listener);

    return this;
  }

  onResetHandler(callback) {
    const listener = (e) => {
      e.preventDefault();

      this.reset();
      if (callback && typeof callback === "function") callback();
    };

    this._form.addEventListener("reset", listener);

    return this;
  }
}

class Generator {
  run(params) {
    const result = [];

    for (let i = 0; i < params.passwordsCount; i++) {
      const password = this.getPassword(
        params.passwordLength,
        params.withSymbols
      );

      result.push({
        value: password,
        entropy: this.getEntropy(password)
      });
    }

    return result;
  }

  getEntropy(password) {
    let n = 0;
    const uniqueCharacters = password.length;

    let hasLowerCase = false,
      hasUpperCase = false,
      hasNumbers = false;

    for (let i = 0; i < uniqueCharacters; i++) {
      const character = password.charAt(i).valueOf();

      if (!hasLowerCase && PASSWORD_LOWER_CASE.includes(character)) {
        n += PASSWORD_LOWER_CASE.length;
        hasLowerCase = true;
      } else if (!hasUpperCase && PASSWORD_UPPER_CASE.includes(character)) {
        n += PASSWORD_UPPER_CASE.length;
        hasUpperCase = true;
      } else if (!hasNumbers && PASSWORD_NUMBERS.includes(character)) {
        n += PASSWORD_NUMBERS.length;
        hasNumbers = true;
      } else if (SYMBOLS.includes(character)) {
        n++;
      }
    }

    const passwordEntropy = Math.trunc(
      uniqueCharacters * (Math.log10(n) / Math.log10(2))
    );

    return passwordEntropy == 0 && !password ? 1 : passwordEntropy;
  }

  getPassword(length, withSymbols) {
    let charset = `${PASSWORD_LOWER_CASE}${PASSWORD_UPPER_CASE}${PASSWORD_NUMBERS}${
        withSymbols ? SYMBOLS : ""
      }`,
      result = "";

    for (let i = 0; i < length; i++) {
      const char = this.getChar(charset);
      charset = charset.replace(char, "");
      result += char;
    }

    return result;
  }

  getChar(str) {
    const match = str.charAt(Math.floor(Math.random() * str.length));

    return match || getChar(str);
  }
}

class Passwords {
  constructor(nodeID) {
    this._node = document.getElementById(nodeID);
  }

  clear() {
    this._node.innerHTML = "";
  }

  render(passwords) {
    this.clear();

    for (const password of passwords) {
      const passwordNode = document.createElement("li");

      passwordNode.appendChild(document.createTextNode(password.value));
      this.setPasswordAttrs(passwordNode, password.entropy);
      this._node.appendChild(passwordNode);
    }
  }

  setPasswordAttrs(domNode, passwordEntropy) {
    let className = "very-weak",
      // title = "Very Weak";
      title = "Common";

    if (passwordEntropy >= 128) {
      className = "very-strong";
      // title = "Very Strong";
      title = "Legendary";
    } else if (passwordEntropy >= 60) {
      className = "strong";
      // title = "Strong";
      title = "Epic";
    } else if (passwordEntropy >= 36) {
      className = "reasonable";
      // title = "Reasonable";
      title = "Rare";
    } else if (passwordEntropy >= 28) {
      className = "weak";
      // title = "Weak";
      title = "Uncommon";
    }

    domNode.setAttribute("title", title);
    domNode.setAttribute("class", `password__row ${className}`);
  }
}

class App {
  start() {
    const passwords = new Passwords("container__passwords");
    const generator = new Generator();

    new Form("params", {
      passwordLength: 10,
      passwordsCount: 3,
      withSymbols: false
    })
      .onSubmitHandler((values) => {
        passwords.render(generator.run(values));
      })
      .onResetHandler(() => {
        passwords.clear();
      });
  }
}

new App().start();