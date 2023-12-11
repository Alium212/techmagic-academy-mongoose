import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minlength: 4,
        maxlength: 50,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 60,
        required: true,
        trim: true,
    },
    fullName: String,
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: (value) => {
                return /\S+@\S+\.\S+/.test(value);
            },
            message: "Invalid email format",
        },
    },
    role: {
        type: String,
        enum: ["admin", "writer", "guest"],
        required: true,
    },
    age: {
        type: Number,
        min: 1,
        max: 99,
        default: 1,
    },
    numberOfArticles: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre("save", function (next) {
    this.fullName = `${this.firstName} ${this.lastName}`;
    next();
});

userSchema.pre("save", function (next) {
    if (this.age < 0) {
        this.age = 1;
    }
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
