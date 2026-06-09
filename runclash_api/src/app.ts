import express, { Application, NextFunction, Request, Response } from "express";
import personRoutes from "./routes/person.route";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import useRoutes from "./routes/user.router";
import userRouter from "./routes/user.router";
import adminUserRouter from "./routes/admin/user.route";
import cors from "cors";

const app: Application = express();
const corsOptions = {
    origin: "http://localhost:3000", // allow only this origin
    SuccessStatus: 200 // for legacy browser support
}
app.use(cors(corsOptions)); // enable CORS with options

app.use(express.json()); // json input
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded

app.use(
    "/api/persons", // base path/prefix
    personRoutes // router object
);
app.use(
    "/api/v1/auth", // base path/prefix
    userRouter // router object
);
app.use(
    "api/v1/admin/user",
    adminUserRouter
);
const PORT: number = 8089;

interface Person {
    id: number;
    name: string;
    age: number;
}
const dataset: Person[] = [
    { id: 1, name: "Ram", age: 30 },
    { id: 2, name: "Hari", age: 25 },
    { id: 3, name: "Bob", age: 35 }
];
// 1. Get All - persons
app.get("/api/persons", (req: Request, res: Response) => {  
    // later paginated
    return res.json(dataset);
});

// 2. Get One by ID - person
app.get("/api/persons/:id", (req: Request, res: Response) => {
    const { id } = req.params; // route parameter
    const person = dataset.find(
        p => p.id === parseInt(id as string)
    ); // find person by id
    return res.json(person);
});

// 3. Create One Person
app.post("/api/persons", (req: Request, res: Response) => {
    const { name, age } = req.body; // body parameters/client data
    const newPerson: Person = {
        id: dataset.length + 1, 
        name,
        age
    };
    dataset.push(newPerson); // add to dataset
    return res.json(newPerson); // 
});

// 4. Update One Person
// 4.1 put -> full update/most update
// 4.2 patch -> partial update/least update
app.put("/api/persons/:id", (req: Request, res: Response) => {
    const { id } = req.params; // route parameter
    const { name, age } = req.body; // body parameters/client data
    const personIndex = dataset.findIndex(
        p => p.id === parseInt(id as string)
    );
    if (personIndex === -1) {
        return res.json({ message: "Person not found" });
    }
    dataset[personIndex] = { id: parseInt(id as string), name, age }; // update person
    return res.json(dataset[personIndex]); // return updated person
});

// 5 Delete One Person
app.delete("/api/persons/:id", (req: Request, res: Response) => {
    const { id } = req.params; // route parameter
    const personIndex = dataset.findIndex(
        p => p.id === parseInt(id as string)
    );
    dataset.splice(personIndex, 1); // delete person
    return res.json({"message": "Deleted"}); 
});

app.get(
    "/", // path
    (req: Request, res: Response) => { // callback function
        return res.send("Hello, TypeScript-Express!");
    }
);

app.get(
    "/hello/world",
    (req: Request, res: Response) => {
        return res.send("Hello, World!");
    }
);
app.get(
    "/hello/world/:name", // :name -> route parameter/alias
    (req: Request, res: Response) => {
        // const name = req.params.name; // without destructuring
        const { name } = req.params; // destructuring
        const { title, age } = req.query; 
        // query params -> /hello/world/John?title=Mr&age=30
        // http://localhost:8089/hello/world/John?title=Mr&age=20
        return res.status(200).json(
            {
                message: `Hello, ${name}!`,
                title,
                age
            }
        )
    }
);

// make a GET requset to match the following URL:
// http://localhost:8089/api/products/123/electronics?sort=asc&limit=10
// 123 and electronics are route parameters, :id and :category
// if category is not "electronics", return 400 with message "Invalid category"
// return 200 with a JSON response with the following structure:
/*
{
    "productId": 123,
    "category": "electronics",
    "sort": "asc",
    "limit": 10
}
*/

app.get("/exception", (req: Request, res: Response) => {
    try{
        const logic: any = {}
        logic.user.find(); // simulate error
    }catch(err: Error | any){
        console.error("Error:", err);
        return res.status(500).json({ message: "Exception Issue" });
    }
});

// global api handler (at the last)
app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({ message: "API not found" });
    }
)
// global error handler (at the last)
app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);
        if(err instanceof HttpException){
            return ApiResponseHelper.error(
                res, err.message, err.status
            );
        }
        return ApiResponseHelper.error(
            res, "Internal Server Error", 500
        );
    }
)

// export techniques
const DUMMY: string = "Dummy Export";

// export object, can be multiple
export {
    PORT, 
    DUMMY
} 

// default export - only one default export per file
export default app;