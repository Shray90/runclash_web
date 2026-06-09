// JS spread operator
// "..." unpack and union
const arr1 = [1, 2, 3]
const arr2 = [4,5]

const arr3 = [arr1, arr2] // [[1,2,3], [4,5]] nested
const arr4 = [...arr1, ...arr2] // [1,2,3,4,5] flat

console.log(arr3)
console.log(arr4)

const arr5 = [
    0, 
    ...arr1,
    6, 
    ...[10, 11, 12],
    13,
    14
]
console.log(arr5)


// object spread
const obj1 = {
    "name": "John",
    "age": 30
}
const obj2 = {
    "country": "Nepal"
}

const obj3 = {obj1, obj2}
const obj4 = {...obj1, ...obj2} 
console.log(obj3)
console.log(obj4)

const obj5 = {
    "id": 1,
    ...{ "title": "N/A", price: 100 },
    "category": "Phone",
    "rating": 4.5,
    ...obj2
}
console.log(obj5)

// CRUD collection example
let data = [
    { id: 1, name: "Ram", age: 30 },
    { id: 2, name: "Shyam", age: 25 },
]
// create
// push
data.push(
    { id: 3, name: "Hari", age: 28 }
)
// spread
data = [...data, { id: 4, name: "Sita", age: 27 }]

// read/find
// find pointer and edit
const found = data.find(item => item.id === 2);
found.name = "Shyam Kumar";
// find index and edit
const foundIndex = data.findIndex(item => item.id === 1); 
data[foundIndex] = { ...data[foundIndex], name: "Ram Kumar" };
data[foundIndex].age = 18;
// .find if not found. -> undefined
// .findIndex if not found -> -1

// delete
data.splice(
    foundIndex, // start from which index
    1 // remove how many
); // mutating

data.splice(
    0, // start from 0 index
    2 // delete 2 elements, 0 and 1 index
)

console.log(data)