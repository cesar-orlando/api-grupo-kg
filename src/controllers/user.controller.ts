import { Request, Response } from "express";
import { User } from "../models/user.model";

// Obtener todos los usuarios
export const getAllUsers = async (_req: Request, res: Response) => {
    const users = await User.find().select("-password"); // sin password
    res.json(users);
};

// Obtener uno por ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json(user);
};


// Crear nuevo usuario
export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
        res.status(400).json({ message: "Email already registered" });
        return
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ message: "User created" });
};

// Actualizar usuario
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
        res.status(404).json({ message: "User not found" })
        return
    };
    res.json({ message: "User updated" });
};

// Eliminar usuario
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
        res.status(404).json({ message: "User not found" });
        return
    }
    res.json({ message: "User deleted" });
};
