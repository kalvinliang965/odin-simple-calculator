
const screen = document.querySelector(".screen");
let expression = "";

main();

function main() {
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
        button.addEventListener("click", number_handler);
    });


    const clearButton = document.querySelector("#clear");
    clearButton.removeEventListener("click", number_handler);
    clearButton.addEventListener("click", clear);
}

function isOperator(op) {
    const operator = "+-*/%";
    return operator.includes(op);
}

function isNum(text) {
    return (text >= '0' && text <= '9');
}

function number_handler(event) {
    enter2screen(event.target.textContent);
}


function enter2screen(newText) {
    const delimiter = /[+\-*\/()%]/;
    const arr = expression.split(delimiter);
    console.log(`expression: ${arr}`);
    const lastElement = arr.at(-1);
    if (newText == '.') {
        // not allow multiple decimals
        if (lastElement.includes('.')) return;
    }  else {
        if (isOperator(newText)) {
            if (expression == "") return; // not allow to start with operator
            if (isOperator(newText) && isOperator(lastElement)) {
                return; // not allow to have mutiple operator at once
            }
        }
    }
    expression += newText;
    let line = screen.lastElementChild;
    if (line == null) {
        line = newLine();
    }
    if (line.textContent != null && 
        line.textContent.length > 13) {
        line = newLine();
    }
    line.textContent = line.textContent + newText;
    screen.appendChild(line);
}

function newLine() {
    const line = document.createElement("div");
    screen.appendChild(line);
    return line;
}

function clear() {
    while (screen.firstElementChild) {
        screen.removeChild(screen.firstElementChild);
    }
    expression = [];
}

function add(a,b) {

}

function sub(a,b) {

}

function mult(a,b) {

}

function div(a,b) {

}

function mod(a,b) {

}

function operate(a,b) {

}

function undo() {

}

function calculate(expression) {

}

function verify() {

}

function infix2postfix(expression) {

}

// handlers...
