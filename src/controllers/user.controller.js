import User from "../models/user.model.js";
import Article from "../models/article.model.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({})
            .select("fullName email age")
            .sort({ age: 1 });
        console.log(users[0].fullName);
        res.json(users);
    } catch (err) {
        next(err);
    }
};

export const getUserByIdWithArticles = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id)
            .select("fullName email age");

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userArticles = await Article.find({ owner: id })
            .select('title subtitle createdAt');

        res.json({ user, userArticles });
    } catch (err) {
        next(err);
    }
};


export const createUser = async (req, res, next) => {
    try {
        const newUser = new User(req.body);
        const createdUser = await newUser.save();
        res.status(201).json(createdUser);
    } catch (err) {
        next(err);
    }
};

export const updateUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        updatedUser.fullName = `${updatedUser.firstName} ${updatedUser.lastName}`;

        updatedUser.save();
        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
};

export const deleteUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        await Article.deleteMany({ owner: id });
        res.json({ message: "User deleted", user: deletedUser });
    } catch (err) {
        next(err);
    }
};
