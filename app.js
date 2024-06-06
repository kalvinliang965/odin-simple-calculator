
const screen = document.querySelector(".screen");
let expression = [];
let showResult = false;
let neg = false;
const LINE_LENGTH = 13;
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
    const negateButton = document.querySelector('#negate');
    negateButton.removeEventListener("click", number_handler);
    negateButton.addEventListener("click", () => {
        enter2screen("neg");
    });
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

function isError(text) {
    return text == "ERROR" || text == "INFINITY" || text == "-INFINITY";
}
function enter2screen(newText) {
    if (showResult) return; // showing the result, not allow to enter anything

    if (!isError(newText)) {
        if (newText == "%") {
            newText = 'R';
        }
        if (newText == "mod") {
            newText = '%';
        }
        if (newText != "neg") {
            const lastElement = expression.at(-1);
            if (expression.length > 0) {
                if (newText == '.' && lastElement.includes('.'))  return;
                else if (!isNum(newText)) {
                    if (newText == 'R' && !isNum(lastElement)) return; // cannot apply percent to non number
                    else if (newText == 'R')
                        expression[expression.length - 1] = (lastElement* 0.001).toFixed(4);
                    else    expression.push(newText);
                } else {
                    if (!isNum(lastElement)){
                        if (neg) {
                            newText = (parseFloat(newText) * -1).toString();
                            neg = false;
                        }
                        expression.push(newText);
                    }                   
                    else                                       
                        expression[expression.length - 1] = lastElement + newText;
                }
            } 
            // empty expression
            else {
                if (!isNum(newText)) 
                    return; // not allow to start with nonNumber
                expression.push(newText);
            }
        } else {
            neg = true;
        }
        if (newText == "neg") {
            return;
        }
    }
    let line = screen.lastElementChild;
    if (line == null) {
        line = newLine();
    }
    if (line.textContent != null && 
        line.textContent.length > LINE_LENGTH) {
        line = newLine();
    }
    if (newText == 'R') {
        let index = line.textContent.length - 1;
        while (!isOperator(line.textContent[index])) index--;
        line.textContent =  line.textContent.substring(0,index + 1);
        let lastElement = expression[expression.length - 1];
        if (line.textContent.length + lastElement.length <= LINE_LENGTH) {
            line.textContent += lastElement;
        } else {
            line = newLine();
            line.textContent = lastElement;
        }
    }
    else                line.textContent = line.textContent + newText;
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
    // neg_list = [];
    neg=false;
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
    // remove from expression
    let lastElement = expression.pop();
    lastElement = lastElement.substring(0, lastElement.length - 1);
    if (lastElement != "") expression.push(lastElement);
    // remove display
    const lastLine = screen.lastElementChild;
    if (lastLine == null) return; // element not exist
    let text = lastLine.textContent;
    text = text.substring(0, text.length - 1);
    if (text == "") {
        screen.removeChild(lastLine);
    } else lastLine.textContent = text; 
}

// function negate(expression, neg_list) {
//     let index;
//     for (let i = 0; i < neg_list.length; i++ ) {
//         index = neg_list[i];
//         if (index < expression.length) {
//             expression[index] *= -1;
//         } else alert(`Invalid index at negate: Index: ${index}`);
//     }
// }

function calculate(expression) {
    // the expression is invalid
    if (!validParentheses(expression)) {
        return "ERROR";
    }
    // negate(expression, neg_list);
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