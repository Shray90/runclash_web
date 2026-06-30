import { IUser, UserModel } from "../models/user.model";
import { CreateUserDTO, CreateUserDTOAdmin, UpdateUserDTO } from "../dtos/user.dto";
import mongoose from "mongoose";

export class UserMongoRepository {
    async createUser(data: CreateUserDTO | CreateUserDTOAdmin): Promise<IUser> {
        return await UserModel.create(data);
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email }).exec();
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        return await UserModel.findOne({ username }).exec();
    }

    async getUserById(id: string): Promise<IUser | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await UserModel.findById(id).exec();
    }

    async update(id: string, data: UpdateUserDTO): Promise<IUser | null> {
        if (!mongoose.isValidObjectId(id)) return null;
        return await UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        if (!mongoose.isValidObjectId(id)) return false;
        const result = await UserModel.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async getAllPaginated(page: number, limit: number, search?: string) {
        const filter = search
            ? {
                  $or: [
                      { firstName: { $regex: search, $options: "i" } },
                      { lastName: { $regex: search, $options: "i" } },
                      { email: { $regex: search, $options: "i" } },
                      { username: { $regex: search, $options: "i" } }
                  ]
              }
            : {};

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            UserModel.find(filter).skip(skip).limit(limit).exec(),
            UserModel.countDocuments(filter).exec()
        ]);

        return { data, total };
    }
}
