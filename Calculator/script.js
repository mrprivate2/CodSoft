// script.js
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

// keep internal expression as string
let currentInput = "";

// update the subtle tracking light on mouse move (for container background)
const container = document.querySelector(".calculator-container");
window.addEventListener("mousemove", (e) => {
  const rect = container.getBoundingClientRect();
  // normalized positions inside container
  const mx = ((e.clientX - rect.left) / rect.width) * 100;
  const my = ((e.clientY - rect.top) / rect.height) * 100;
  // set CSS variable used by pseudo-element background
  container.style.setProperty("--mx", mx + "%");
  container.style.setProperty("--my", my + "%");
});

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.innerText.trim();

    // special dataset actions
    if (btn.dataset.action === "clear") {
      currentInput = "";
      display.innerText = "";
      return;
    }

    if (btn.dataset.action === "backspace") {
      currentInput = currentInput.slice(0, -1);
      display.innerText = currentInput;
      return;
    }

    if (btn.dataset.action === "equals" || value === "=") {
      // replace % usage: interpret 'number%' as number/100 if present
      // simple approach: convert occurrences like '50%' to '(50/100)'
      let expr = currentInput.replace(/(\d+(\.\d+)?)%/g, "($1/100)");
      try {
        // eval is used for simplicity — for production consider a proper parser
        const result = eval(expr);
        currentInput = (result === undefined || result === null) ? "" : result.toString();
        display.innerText = currentInput;
      } catch {
        display.innerText = "Error";
        currentInput = "";
      }
      return;
    }

    // append button text to expression (basic validation)
    // prevent multiple dots in a number: simple rule - allow dot if previous token doesn't end with a dot
    if (value === ".") {
      // disallow starting with dot without leading zero
      if (currentInput === "" || /[+\-*/(%]$/.test(currentInput)) {
        currentInput += "0.";
      } else if (!/\d+\.$/.test(currentInput)) {
        // allow if last token doesn't already have a dot
        // find the last number token
        const tokens = currentInput.split(/[+\-*/()]/);
        const last = tokens[tokens.length - 1] || "";
        if (!last.includes(".")) currentInput += ".";
      }
      display.innerText = currentInput;
      return;
    }

    // If it's an operator, ensure validity (don't allow two operators in a row)
    if (/[+\-*/]/.test(value)) {
      if (currentInput === "") return; // don't start with operator (except minus could be allowed)
      if (/[+\-*/]$/.test(currentInput)) {
        // replace last operator with new one
        currentInput = currentInput.slice(0, -1) + value;
      } else {
        currentInput += value;
      }
      display.innerText = currentInput;
      return;
    }

    // percent sign: append '%' so equals handler handles it
    if (value === "%") {
      // don't allow % after operator or at start
      if (currentInput === "" || /[+\-*/]$/.test(currentInput)) return;
      currentInput += "%";
      display.innerText = currentInput;
      return;
    }

    // default: digits and other allowed chars
    if (/^[0-9]$/.test(value)) {
      currentInput += value;
      display.innerText = currentInput;
      return;
    }

    // fallback: just append (for any other symbols)
    currentInput += value;
    display.innerText = currentInput;
  });
});
