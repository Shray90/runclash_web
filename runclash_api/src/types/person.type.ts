
// export interface Person {
//     id: number;
//     name: string;
//     age: number;
// }
import { z } from "zod";

export const personSchema = z.object(
    {
        id: z.number(),
        name: z.string("Should be string").min(1, "Name is required"),
        age: z.number("Should be number").min(0, "Age must be positive")
    }
)
// domain model - what is person in the application
export type Person = z.infer<typeof personSchema>; // convert to type