"use strict";

const allButton = document.querySelectorAll("button");
const display = document.getElementById("display");
const operationDisplay = document.querySelector(".operation_screen");

// Initialize the display with 0
display.innerHTML = "0";

let lastInputType = "number"; // Track the last input type: 'number', 'operator', or 'dot'

let acPressTimer = null; // Timer to detect long press on AC button

allButton.forEach((button) => {
  const clicked = function () {
    const addToDisplay = button.dataset.value;

    if (display.innerHTML === "Error") {
      // Clear the "Error" message if the user starts typing anything
      display.innerHTML = "0";
    }

    if (addToDisplay === "=") {
      // If the display contains an incomplete expression, do nothing
      if (
        lastInputType === "operator" ||
        display.innerHTML === "" ||
        display.innerHTML === "0"
      ) {
        return;
      }

      try {
        // Replace operators for JS evaluation
        let expression = display.innerHTML
          .replace("÷", "/")
          .replace("x", "*")
          .replace("%", "/100"); // Ensure percentage is divided by 100

        // Ensure the expression is complete (has at least two operands and one operator)
        const hasOperator = /[+\-÷x%]/.test(display.innerHTML);
        const hasSecondOperand = /\d/.test(
          display.innerHTML.split(/[+\-÷x%]/).pop()
        );

        if (hasOperator && hasSecondOperand) {
          let result = eval(expression); // Evaluate the expression

          // Check if the result is a floating-point number with more than 4 decimal places
          if (result % 1 !== 0) {
            result = result.toFixed(4); // Format the result to 4 decimal places if it's a decimal
          }

          operationDisplay.innerHTML = display.innerHTML; // Show full expression
          display.innerHTML = result; // Show result
          lastInputType = "number";
        } else {
          // Do nothing if the expression is incomplete
          return;
        }
      } catch (error) {
        display.innerHTML = "Error"; // Handle invalid expressions
        console.error("Invalid expression:", error);
      }
    } else if (addToDisplay === "AC") {
      // Check if it's a long press (longer than 0.5 seconds)
      if (acPressTimer) {
        // Clear the entire screen after a long press
        display.innerHTML = "0";
        operationDisplay.innerHTML = "";
        lastInputType = "number";
        clearTimeout(acPressTimer); // Clear the timer
        acPressTimer = null;
      } else {
        // Short press, remove the last number
        if (display.innerHTML.length > 1) {
          display.innerHTML = display.innerHTML.slice(0, -1);
        } else {
          display.innerHTML = "0";
        }
      }
    } else if (addToDisplay === "+/-") {
      // Toggle the sign with or without brackets
      if (display.innerHTML !== "0") {
        if (
          display.innerHTML.startsWith("(-") &&
          display.innerHTML.endsWith(")")
        ) {
          // If it's negative with brackets, remove the brackets and negative sign
          display.innerHTML = display.innerHTML.slice(2, -1);
        } else if (display.innerHTML.startsWith("-")) {
          // If it's negative, remove the negative sign
          display.innerHTML = display.innerHTML.slice(1);
        } else {
          // Otherwise, add the negative sign and brackets
          display.innerHTML = `(-${display.innerHTML})`;
        }
      }
    } else if (["+", "-", "÷", "x"].includes(addToDisplay)) {
      // Handle operators
      if (lastInputType === "operator") {
        // Replace the last operator
        display.innerHTML = display.innerHTML.slice(0, -1) + addToDisplay;
      } else {
        display.innerHTML += addToDisplay;
      }
      lastInputType = "operator";
    } else if (addToDisplay === ".") {
      // Allow one decimal point per number
      const parts = display.innerHTML.split(/[\+\-\÷x]/); // Split by operators
      const currentNumber = parts[parts.length - 1]; // Get the last number
      if (!currentNumber.includes(".")) {
        display.innerHTML += addToDisplay;
        lastInputType = "dot";
      }
    } else if (addToDisplay === "%") {
      // Handle percentage calculation ONLY when there's no operator following
      if (lastInputType === "number" && !display.innerHTML.includes("%")) {
        // If the display is a number and there's no operator after it
        const num = parseFloat(display.innerHTML);
        if (!isNaN(num)) {
          display.innerHTML = (num / 100).toString(); // Divide by 100 for percentage
          lastInputType = "number"; // Treat the result as a number
        }
      }
    } else {
      // Handle numbers
      if (display.innerHTML === "0" && lastInputType !== "dot") {
        // Replace 0 with the number
        display.innerHTML = addToDisplay;
      } else {
        display.innerHTML += addToDisplay; // Append the number
      }

      lastInputType = "number";
    }
  };

  // Event listener for button click
  button.addEventListener("click", clicked);

  // Handle AC long press (hold for 0.5 seconds)
  if (button.dataset.value === "AC") {
    button.addEventListener("mousedown", () => {
      // Start the timer when the button is pressed down
      acPressTimer = setTimeout(() => {
        // Clear the screen after 0.5 seconds
        display.innerHTML = "0";
        operationDisplay.innerHTML = "";
        lastInputType = "number";
      }, 150);
    });

    button.addEventListener("mouseup", () => {
      // Clear the timer when the button is released
      if (acPressTimer) {
        clearTimeout(acPressTimer);
        acPressTimer = null;
      }
    });

    button.addEventListener("mouseleave", () => {
      // Ensure the timer is cleared if the mouse leaves the button
      if (acPressTimer) {
        clearTimeout(acPressTimer);
        acPressTimer = null;
      }
    });
  }
});
