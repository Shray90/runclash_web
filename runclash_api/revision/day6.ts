// Object representation
// 1. on declaration
const obj1: {
    name: string;
    age: number;
    isPresent?: boolean; // ? means optional
} = {
    name: "Alice",
    age: 30,
    // isPresent: true // optional
}
console.log(obj1);

// 2. using type
type ProductType = {
    id: number;
    title: string;
    price?: number | number[]; // union type/optional
}
const product1: ProductType = {
    id: 1,
    title: "Laptop",
    price: [999.99, 1999.99]
}
console.log(product1);

// 3. using interface
interface IUserInterface {
    username: string | number; // union type
    email: string;
    isActive?: boolean;
}
const user1: IUserInterface = {
    username: 123,
    email: "xyz@gmail.com"
}
console.log(user1);

// 4. Using class - OOP
class User{
    // encapsulation
    username: string;
    email: string;
    isActive: boolean = true; // default value
    constructor(username: string, email: string){
        this.username = username;
        this.email = email;
    }
    // ... methods
}
const user2 = new User("Bob", "bob@gmail.com");
console.log(user2)
class Employee extends User{ 
    // inheritance
    private empId: number;
    constructor(username: string, email: string, empId: number){
        super(username, email); // call parent constructor
        this.empId = empId;
    }
}
// Polymorphism
const user3: User = new Employee("Charlie", "charlie@gmail.com", 123);
console.log(user3);

// Abstraction 
interface IShape{
    area(): number;
}
class Square implements IShape{
    side: number;
    constructor(side: number){
        this.side = side;
    }
    area(): number {
        return this.side * this.side;
    }
}

// task
type ComplexType = {
    id: number;
    user: User;
    products: ProductType[];
    square: Square;
    userDetails: IUserInterface;
}
const complexObj: ComplexType = {
    // fill this object with new data
    id: 1,
    user: new User("Ram", "ra@gmail.com"),
    products: [ { id: 1, title: "Laptop", price: 999.99 } ],
    square: new Square(5),
    userDetails: { username: "Ram", email: "ra@gmail.com" }
}
console.log(complexObj.square.area());

type PhoneType = { title: string }
type NetworkType = { provider: string }

type CallType = PhoneType | NetworkType; // union type "|"
const ct1: CallType = { title: "iPhone" };
const ct2: CallType = { provider: "Verizon" };
console.log(ct1, ct2);

type MobileType = PhoneType & NetworkType; // intersection type "&"
const mt1: MobileType = { title: "iPhone", provider: "Verizon" }; // both attributes
console.log(mt1);

// Generic - Type injection
const genericFn = <T>(arg: T): T => {
    console.log(arg, typeof arg);
    return arg;
}
genericFn<string>("Hello"); // <T> is replaced by string
genericFn<number>(123); // <T> is replaced by number

interface IApiResponse<T, K>{
    success: boolean;
    message: string;
    data: T;
    error?: K;
}
const res1: IApiResponse<ProductType, string> = {
    success: true,
    message: "Product fetched successfully",
    data: { id: 1, title: "Laptop", price: 999.99 }
}
const res2: IApiResponse<IUserInterface, string> = {
    success: false,
    message: "Failed to fetch product",
    data: { username: "Alice", email: "alice@gmail.com" },
    error: "Product found"
}
console.log(res1, res2);

const arr1: Array<string> = ["a", "b", "c"]; // generic array type
console.log(arr1);

// Useful type generic
type Category = {
    title: string;
    id: number;
    status?: string;
    isParent?: boolean;
}
const gen1: Required<Category> = 
    { title: "A", id: 1, status: "active", isParent: true }; // all attributes required
const gen2: Partial<Category> = { title: "B" }; // all attributes optional
const gen3: Readonly<Category> = { title: "C", id: 3 }; // all attributes readonly
// gen3.title = "D"; // cannot change readonly attribute
const gen4: Pick<Category, "title" | "status"> = 
    { title: "D", status: "inactive" }; // only pick title and status
const gen5: Omit<Category, "title" | "isParent"> = 
    {  id: 5 }; // omit title and isParent
console.log(gen1, gen2, gen3, gen4, gen5);

// Task - fill the data
// const t1: Required< Pick<Category, "title" | "id"> > = { 

// };

// const t2: Omit< Pick<Category, "title" | "id" | "status">, "status" > ={
    
// }
// const t3: Pick< Omit<Category, "isParent">, "title" | "status" > & {
//     price: number | number[];
//     description: string | string[] | ProductType;
// } = {

// }