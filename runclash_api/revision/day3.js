// Syncronous and Asyncronous
// macro task
setTimeout(
    () => {
        console.log("Hello World");
    },
    2000 // 2 sec
);

console.log("End of the program");

// micro task
const promiseExample = () => new Promise(
    (resolve, reject) => {
        setTimeout(
            () => {
                resolve("Promise Success")
            },
            1000 // 1 sec
        );
    }
);
promiseExample()
    .then(result => console.log(result))
    .catch(error => {
        console.log("Error in promise")
        console.log(error)
    }
    );

console.log("After promise");

// syncronous execution
const main = async () => {
    console.log("Start of main function");
    try {
        const result = await promiseExample();
        console.log(result);
    } catch (error) {
        console.log("Error in main function")
        console.log(error)
    }
    console.log("End of main function");
}

main();

const isEven = (num) => new Promise(
    (resolve, reject) => {
        if (num % 2 === 0) {
            resolve("Even number");
        } else {
            reject("Odd number");
        }
    }
)
const isPositive = (num) => new Promise(
    (resolve, reject) => {
        if (num > 0) {
            resolve("Positive number");
        } else {
            reject("Negative number");
        }
    }
)
// 1. syncronously call isEven and isPositive functions in same block
// 2. using .then and .catch call isEven then isPositive sequentially

const synchronousCheck = async () => {
    // use both await here
    const evenResult = await isEven(2);
    console.log(evenResult);
    const positiveResult = await isPositive(2);
    console.log(positiveResult);
}

// 2. 
isEven(2)
    .then(result => {
        console.log(result);
        isPositive(2)
            .then(result => console.log(result))
            .catch(error => console.log(error));
    })
    .then(result => console.log(result))
    .catch(error => console.log(error));

// Promise parallelism
const timeFunc1 = () => new Promise(
    (resolve, reject) => {
        setTimeout(() => { resolve("Time func 1") }, 2000);
    }
);
const timeFunc2 = () => new Promise(
    (resolve, reject) => {
        setTimeout(() => { resolve("Time func 2") }, 3000);
    }
);
const timeFunc3 = () => new Promise(
    (resolve, reject) => {
        setTimeout(() => { reject("Time func 3") }, 1000);
    }
);
const sequentialExecution = async () => {
    console.time("Sequential Execution");
    const result1 = await timeFunc1();
    console.log(result1);
    const result2 = await timeFunc2();
    console.log(result2);
    console.timeEnd("Sequential Execution");
}

sequentialExecution(); // total time taken = 5 sec

const parallelExecution = async () => {
    console.time("Parallel Execution");
    const [r1, r2] = await Promise.all(
        [
            timeFunc1(),
            timeFunc2(),
            // timeFunc3()
        ]
    );
    console.log(r1, r2);
    console.timeEnd("Parallel Execution");
}
parallelExecution(); // total time taken = 3 sec(max)

const parallelExecutionSettled = async () => {
    console.time("Parallel Execution Settled");
    const [r1, r2, r3] = await Promise.allSettled(
        [
            timeFunc1(),
            timeFunc2(),
            timeFunc3()
        ]
    );
    console.log(r1.status, r1.value);
    console.log(r2.status, r2.value);
    console.log(r3.status, r3.reason);
    console.timeEnd("Parallel Execution Settled");
}
parallelExecutionSettled(); // total time taken = 3 sec(max)