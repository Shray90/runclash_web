import { z } from "zod";
import { personSchema } from "../types/person.type";

// DTO - data transfer object - what is person in the request/response
export const CreatePersonDTO = personSchema.omit({ id: true }); 
// export const CreatePersonDTO = personSchema.pick({ name: true, age: true }); 
// alternative
// for create, id is not required
export type CreatePersonDTO = z.infer<typeof CreatePersonDTO>;
