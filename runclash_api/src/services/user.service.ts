import { CreateUserDTO, CreateUserDTOAdmin, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import { UserMongoRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export class UserService {
    async createUser(userData: CreateUserDTO | CreateUserDTOAdmin): Promise<IUser> {
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }
        const existingUsername = await userRepository.getUserByUsername(userData.username);
        if (existingUsername) {
            throw new HttpException(400, "Username already exists");
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;
        const user = await userRepository.createUser(userData);
        return user;
    }

    async loginUser(loginData: LoginUserDTO) {
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpException(400, "Invalid email");
        }
        const passwordValid = await bcrypt.compare(loginData.password, user.password);
        if (!passwordValid) {
            throw new HttpException(400, "Invalid password");
        }
        const token = jwt.sign(
            { id: user._id.toString(), email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        return { user, token };
    }

    async checkPassword(userId: string, currentPassword: string): Promise<boolean> {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
            throw new HttpException(400, "Current password is incorrect");
        }
        return true;
    }

    async updateUser(id: string, userData: UpdateUserDTO): Promise<IUser> {
        const existing = await userRepository.getUserById(id);
        if (!existing) {
            throw new HttpException(404, "User not found");
        }
        if (userData.email && userData.email !== existing.email) {
            const emailTaken = await userRepository.getUserByEmail(userData.email);
            if (emailTaken) {
                throw new HttpException(400, "Email already exists");
            }
        }
        if (userData.username && userData.username !== existing.username) {
            const usernameTaken = await userRepository.getUserByUsername(userData.username);
            if (usernameTaken) {
                throw new HttpException(400, "Username already exists");
            }
        }
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        const updated = await userRepository.update(id, userData);
        if (!updated) {
            throw new HttpException(500, "Failed to update user");
        }
        return updated;
    }

    async deleteUser(id: string): Promise<boolean> {
        const existing = await userRepository.getUserById(id);
        if (!existing) {
            throw new HttpException(404, "User not found");
        }
        const deleted = await userRepository.delete(id);
        if (!deleted) {
            throw new HttpException(500, "Failed to delete user");
        }
        return deleted;
    }

    async getUserById(id: string): Promise<IUser> {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        return user;
    }

    async getAllUserPaginated(page?: string, limit?: string, search?: string) {
        const currentPage = page && Number(page) > 0 ? Number(page) : 1;
        const currentLimit = limit && Number(limit) > 0 ? Number(limit) : 10;
        const searchTerm = search?.trim() ? search : undefined;

        const { data, total } = await userRepository.getAllPaginated(currentPage, currentLimit, searchTerm);
        const totalPages = Math.max(1, Math.ceil(total / currentLimit));
        const pagination = {
            page: currentPage,
            limit: currentLimit,
            total,
            totalPages,
        };
        return { data, pagination };
    }
}
