const PASSWORD_LOWER_CASE = "abcdefghijkmnpqrstuvwxyz"; // without: ['l', 'o']
const PASSWORD_UPPER_CASE = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // without: ['I', 'O']
const PASSWORD_NUMBERS = "123456789"; // without: ['0']
const SYMBOLS = "!@#$%^&*()_+-=[]{}'"; // without: ['|']

class Select {
  constructor(nodeID, initial) {
    this._node = document.getElementById(nodeID);
    this._initial = initial;

    this.reset();
  }

  reset() {
    this._node.value = this._initial;
  }

  get value() {
    return this._node.value;
  }
}

class Checkbox {
  constructor(nodeID, initial) {
    this._node = document.getElementById(nodeID);
    this._initial = initial;

    this.reset();
  }

  reset() {
    this._node.checked = this._initial;
  }

  get value() {
    return this._node.checked;
  }
}

class Button {
  constructor(nodeID) {
    this._node = document.getElementById(nodeID);
  }

  onClickHandler(listener) {
    this._node.addEventListener("click", listener);
  }
}

class Generator {
  constructor(length, count, withSymbols) {
    this._length = length;
    this._count = count;
    this._withSymbols = withSymbols;
  }

  run() {
    this.clearPasswords();

    for (let i = 0; i < this._count.value; i++) {
      const password = this.getPassword();

      this._passwords.push({
        value: password,
        entropy: this.getEntropy(password),
      });
    }

    this._passwordsContainer.render(this._passwords);
  }

  getEntropy(password) {
    let n = 0,
      uniqueCharacters = password.length;

    let hasLowerCase = false,
      hasUpperCase = false,
      hasNumbers = false;

    for (let i = 0; i < password.length; i++) {
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

  getPassword() {
    let charset = `${PASSWORD_LOWER_CASE}${PASSWORD_UPPER_CASE}${PASSWORD_NUMBERS}${
        this._withSymbols.value ? SYMBOLS : ""
      }`,
      result = "";

    for (let i = 0; i < this._length.value; i++) {
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

  clearPasswords() {
    this._passwords = [];
  }

  reset() {
    this.clearPasswords();
    this._length.reset();
    this._count.reset();
    this._withSymbols.reset();
    this._passwordsContainer.clear();
  }

  setPasswordsContainer(passwordsContainer) {
    this._passwordsContainer = passwordsContainer;

    return this;
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

    const passwordLength = new Select("passwordLength", 10);
    const passwordsCount = new Select("passwordsCount", 3);
    const withSymbols = new Checkbox("withSymbols", false);

    const generator = new Generator(
      passwordLength,
      passwordsCount,
      withSymbols
    ).setPasswordsContainer(passwords);

    const generateButton = new Button("generateButton");
    generateButton.onClickHandler(() => generator.run());

    const clearButton = new Button("clearButton");
    clearButton.onClickHandler(() => generator.reset());
  }
}

new App().start();