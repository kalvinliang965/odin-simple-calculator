
const screen = document.querySelector(".screen");
let expression = [];
let showResult = false;

main();

function main() {
    const buttons = document.querySelectorAll("button");
    buttons.forEach((button) => {
        button.addEventListener("click", number_handler);
    });
    const clearButton = document.querySelector("#clear");
    clearButton.removeEventListener("click", number_handler);
    clearButton.addEventListener("click", clear);

    const deleteButton = document.querySelector("#delete");
    deleteButton.removeEventListener("click", number_handler);
    deleteButton.addEventListener("click", undo);

    const equalButton = document.querySelector("#equal");
    equalButton.removeEventListener("click", number_handler);
    equalButton.addEventListener("click", () => {
        const ret = calculate(expression);
        clear();
        enter2screen(ret);
        showResult = true;
    });
}

function isOperator(op) {
    const operator = "+-*/%";
    return operator.includes(op);
}

function isNum(text) {
    return !isNaN(Number(text));
}

function precedence(op) {
    switch(op) {
        case '$':
            return 0;
        case '(':
            return 1;
        case '+':
        case '-':
            return 2;
        case '*':
        case '/':
        case '%':
            return 3;
        default:
            alert(`Error: precedence recieve: ${op}`);
            return -1; 
    }
}

function number_handler(event) {
    enter2screen(event.target.textContent);
}

function enter2screen(newText) {
    if (showResult) return; // showing the result, not allow to enter anything
    const lastElement = expression.at(-1);

    if (expression.length > 0) {
        if (newText == '.' && lastElement.includes('.'))  return;
        else if (isOperator(newText)) {
            if (isOperator(expression.at(-2))) return;
            expression.push(newText);
            expression.push("");
        } else expression[expression.length - 1] = lastElement + newText;
    } 
    // empty expression
    else {
        if (isOperator(newText)) return; // not allow to start with operator
        expression.push(newText);
    }
    
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
    showResult = false;
}

function operate(a,b, op) {
    switch(op) {
        case '+':
            // console.log(`a: ${a}`);
            // console.log(`b: ${b}`);
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            if (a === 0 && b === 0)
                return "ERROR";
            if (a > 0 && b === 0) 
                return "INFINITY";
            if (a < 0 && b === 0) 
                return "-INFINITY";

            return a / b;
        case '%':
            return a % b;
        default:
            alert(`Error in operate: op:${op}`);
    }
}

function undo() {
    if (showResult) return; // showing the result, not allow to remove anything
    const lastLine = screen.lastElementChild;
    if (lastLine == null) return; // element not exist
    let text = lastLine.textContent;
    text = text.substring(0, text.length - 1);
    if (text == "") {
        screen.removeChild(lastLine);
    } else lastLine.textContent = text; 

}

function calculate(expression) {
    // the expression is invalid
    if (!validParentheses(expression)) {
        clear();
        enter2screen("ERROR");
        return;
    }
    const postfix = infix2postfix(expression);
    const N = postfix.length;
    stack = [];
    let token, a, b, c, ret;
    for (let i = 0; i < N; i++) {
        token = postfix[i];
        if (isNum(token)) {
            stack.push(token);
        } else if (isOperator(token)) {
            b = parseFloat(stack.pop());
            if (isNaN(b)) return "ERROR";
            a = parseFloat(stack.pop());
            if (isNaN(a)) return "ERROR";
            c = operate(a, b, token);
            if (typeof(c) == "string") return c; // error
            stack.push(c + "");
        } else {
            alert(`ERROR in myEval: token is invalid: ${token}`);
        }
    }
    console.log(`stack: ${stack}`);
    ret = parseFloat(stack.pop());
    if (Number.isInteger(ret)) {
        return parseInt(ret);
    } else return ret.toFixed(4);
}

function validParentheses(expression) {
    stack = [];
    let token;
    let stackElement;
    const N = expression.length;
    for (let i = 0; i < N; i++) {
        token = expression[i];
        if (token == '(')   stack.push(token);
        else if (token == ')') {
            if (stack.length == 0) return false;
            stackElement = stack.pop();
            if (stackElement != '(') {
                alert(`stack contain invalid token: ${stackElement}`);
                return false;
            }
        }
    }
    if (stack.length != 0) return false;
    return true;
}

function infix2postfix(infix) {
    let postfix = [];
    let opStack = [];
    let topOp; // top operator
    opStack.push('$');
    const N = infix.length;
    let token;
    for (let i = 0; i < N; i++) {
        token = infix[i];
        console.log(`token: ${token}`);
        console.log(`postfix: ${postfix}`)
        if (isNum(token)) postfix.push(token);
        else if (token == '(') opStack.push(token);
        else if (token == ')') {
            topOp = opStack.pop();
            while (topOp != '(') {
                postfix.push(topOp); 
                topOp = opStack.pop();
            }
        } else if (isOperator(token)) {
            topOp = opStack[opStack.length - 1];
            while (precedence(token) <= precedence(topOp)) {
                postfix.push(topOp);
                opStack.pop();
                topOp = opStack[opStack.length - 1];
            }
            opStack.push(token);
        }
    }
    topOp = opStack.pop();
    while (topOp != '$') {
        postfix.push(topOp);
        topOp = opStack.pop();
    }
    return postfix;
}