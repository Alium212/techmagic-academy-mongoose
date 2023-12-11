import Article from "../models/article.model.js";
import User from "../models/user.model.js";

export const getArticles = async (req, res, next) => {
    try {
        const { title, page = 1, limit = 10 } = req.query;

        const articles = await Article.find({ title: new RegExp(title, "i") })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate({
                path: "owner",
                select: "fullName email age",
            });

        res.json(articles);
    } catch (err) {
        next(err);
    }
};

export const getArticleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await Article.findById(id).populate({
            path: "owner",
            select: "fullName email age",
        });

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }
        res.json(article);
    } catch (err) {
        next(err);
    }
};

export const createArticle = async (req, res, next) => {
    try {
        const { title, subtitle, description, owner, category } = req.body;

        const existingUser = await User.findById(owner);
        if (!existingUser) {
            return res.status(404).json({ message: "Owner not found" });
        }

        const article = new Article({
            title,
            subtitle,
            description,
            owner,
            category,
        });
        const newArticle = await article.save();

        existingUser.numberOfArticles += 1;
        await existingUser.save();

        res.status(201).json(newArticle);
    } catch (err) {
        next(err);
    }
};

export const updateArticleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { owner } = req.body;

        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        if (article.owner.toString() !== owner) {
            return res
                .status(403)
                .json({ message: "Not authorized to update this article" });
        }

        Object.keys(req.body).forEach((key) => {
            if (key !== '_id' && key !== 'owner' && req.body[key] !== undefined) {
                article[key] = req.body[key];
            }
        });

        article.updatedAt = Date.now();

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } catch (err) {
        next(err);
    }
};


export const deleteArticleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { owner } = req.body;

        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        if (article.owner.toString() !== owner) {
            return res
                .status(403)
                .json({ message: "Not authorized to delete this article" });
        }

        const user = await User.findById(owner);
        if (user) {
            user.numberOfArticles -= 1;
            await user.save();
        }

        await Article.deleteOne({ _id: id });
        res.json({ message: "Article deleted" });
    } catch (err) {
        next(err);
    }
};
