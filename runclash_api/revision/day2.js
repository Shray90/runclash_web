// function
function functionName(arg1, arg2) {
    const result = arg1 + arg2;
    console.log(result);
    return result;
}
const ret = functionName(2, 3);
console.log(ret);

// variable refereced function
const variableFunction = function () {
    console.log("Some result");
}
variableFunction();

// arrow function
const arrowFunction = (arg) => "Hello " + arg;
const ret2 = arrowFunction("World");
console.log(ret2);

// arrow function behaviour
const arrowFunction2 = () => {
    console.log("Scope arrow")
    return "Something"
}
arrowFunction2();

const obj = {
    "name": "Sabin",
    func1: function () {
        console.log("Scope normal", this.name);
    },
    func2: () => {
        console.log("Scope arrow", this.name); // undefined
    }
}
// arrow function is anonymous 
obj.func1();
obj.func2();

// closure and callback
const outerFunction = (outerArg) => {
    let counter = outerArg
    const innerFunction = () => {
        counter++;
        console.log(counter);
    }
    return innerFunction;
}
const closureFunc = outerFunction(1);
closureFunc(); // 2
closureFunc(); // 3 -> preserves the state of counter variable

const clousureFunc2 = outerFunction(1);
clousureFunc2(); // 2 -> new instance of counter variable

closureFunc();

// Higher order function, callback
const hof1 = (arg1, callback) => {
    callback(arg1);
}
const callbackFunc = (arg) => {
    console.log("Hello", arg);
}
hof1("World", callbackFunc);
hof1("World", (arg)=> console.log("Hi", arg));

const calculate = (num1, num2, cb) => {
    const result = cb(num1, num2);
    console.log(result);
    return result;
}
const addition = (a, b) => a + b;
const additionResult = calculate(2, 3, addition); 
const substractionResult = calculate(5, 2, (a, b) => a - b);

// list/collecion callback
const fruits = ["apple", "mango", "grapes"];
// iteration using callback
const howToIterate = (item, index, arr)=> {
    // logic to iterate
    console.log(index, item);
}
fruits.forEach(howToIterate);

fruits.forEach(
    (item, index) => console.log(index, item)
);

// map/transform
const transformedFruits = fruits.map(
    (item, idx, arr) => item.toUpperCase()
);
console.log(transformedFruits);

// UI/UX
const liTags = fruits.map(
    (item, idx) => {
        let classname = "";
        if (idx % 2 === 0) {
            classname = "bg-light text-dark";
        }else{
            classname = "bg-dark text-light";
        }
        return `<li id="${item}" class="${classname}">${item}</li>`;
    }
)
console.log(liTags);

const filteredFruits = fruits.filter(
    (item, idx, arr) => item.length > 5
);
console.log(filteredFruits);

const accumulatedValue = fruits.reduce(
    (acc, item, idx, arr) => acc + item, 
    "" // initial state
);
console.log(accumulatedValue);


const students = [
    { name: "Sabin", age: 25, grade: 80},
    { name: "Ram", age: 22, grade: 90},
    { name: "Shyam", age: 24, grade: 85},
    { name: "Harry", age: 26, grade: 50},
    { name: "Alice", age: 23, grade: 95},
]
// 1. Using map, return new array of student names only
// 2. Using filter, return new array of students who scored above 80
// 3. Using filter, return new array of students with even index
// 4, Using reduce, return the total grade of all students

const studentName = students.map(
    (student) => student.name
);
console.log(studentName);

const above80 = students.filter(
    (item, idx, arr) => item.grade > 80
);
console.log(above80);
