import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category';

dotenv.config();

const categories = [
    {
        "id": 1,
        "name": "Academic",
        "description": "Educational and academic books",
        "has_child": true,
        "parent_id": null,
        "icon_name": "school",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
    },
    {
        "id": 2,
        "name": "Fiction",
        "description": "Fictional stories and novels",
        "has_child": true,
        "parent_id": null,
        "icon_name": "book-open",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
    },
    {
        "id": 3,
        "name": "Non-Fiction",
        "description": "Real-world and factual books",
        "has_child": true,
        "parent_id": null,
        "icon_name": "library",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
    },
    {
        "id": 4,
        "name": "Magazines",
        "description": "Periodicals and magazines",
        "has_child": true,
        "parent_id": null,
        "icon_name": "magazine",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
    },
    {
        "id": 5,
        "name": "Children",
        "description": "Books for kids and teens",
        "has_child": true,
        "parent_id": null,
        "icon_name": "child",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
    },

    {
        "id": 6,
        "name": "School Books",
        "description": "Books for classes 1 to 12",
        "has_child": true,
        "parent_id": 1,
        "icon_name": "notebook",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:05:00Z",
        "updated_at": "2026-01-01T10:05:00Z"
    },
    {
        "id": 7,
        "name": "Competitive Exams",
        "description": "Exam preparation books",
        "has_child": true,
        "parent_id": 1,
        "icon_name": "target",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:05:00Z",
        "updated_at": "2026-01-01T10:05:00Z"
    },
    {
        "id": 8,
        "name": "College Textbooks",
        "description": "Undergraduate and postgraduate books",
        "has_child": false,
        "parent_id": 1,
        "icon_name": "school",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:05:00Z",
        "updated_at": "2026-01-01T10:05:00Z"
    },

    {
        "id": 9,
        "name": "Science",
        "description": "Physics, Chemistry, Biology",
        "has_child": false,
        "parent_id": 6,
        "icon_name": "atom",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:10:00Z",
        "updated_at": "2026-01-01T10:10:00Z"
    },
    {
        "id": 10,
        "name": "Mathematics",
        "description": "Mathematics textbooks",
        "has_child": false,
        "parent_id": 6,
        "icon_name": "calculator",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:10:00Z",
        "updated_at": "2026-01-01T10:10:00Z"
    },
    {
        "id": 11,
        "name": "Social Studies",
        "description": "History, Civics, Geography",
        "has_child": false,
        "parent_id": 6,
        "icon_name": "globe",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:10:00Z",
        "updated_at": "2026-01-01T10:10:00Z"
    },

    {
        "id": 12,
        "name": "UPSC",
        "description": "Civil services exam books",
        "has_child": false,
        "parent_id": 7,
        "icon_name": "government",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:15:00Z",
        "updated_at": "2026-01-01T10:15:00Z"
    },
    {
        "id": 13,
        "name": "JEE",
        "description": "Engineering entrance exam books",
        "has_child": false,
        "parent_id": 7,
        "icon_name": "gear",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:15:00Z",
        "updated_at": "2026-01-01T10:15:00Z"
    },
    {
        "id": 14,
        "name": "NEET",
        "description": "Medical entrance exam books",
        "has_child": false,
        "parent_id": 7,
        "icon_name": "medical",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:15:00Z",
        "updated_at": "2026-01-01T10:15:00Z"
    },

    {
        "id": 15,
        "name": "Novels",
        "description": "Fictional long stories",
        "has_child": true,
        "parent_id": 2,
        "icon_name": "bookmark",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:20:00Z",
        "updated_at": "2026-01-01T10:20:00Z"
    },
    {
        "id": 16,
        "name": "Short Stories",
        "description": "Short fictional stories",
        "has_child": false,
        "parent_id": 2,
        "icon_name": "file-text",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:20:00Z",
        "updated_at": "2026-01-01T10:20:00Z"
    },
    {
        "id": 17,
        "name": "Poetry",
        "description": "Poems and verses",
        "has_child": false,
        "parent_id": 2,
        "icon_name": "feather",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:20:00Z",
        "updated_at": "2026-01-01T10:20:00Z"
    },

    {
        "id": 18,
        "name": "Romance",
        "description": "Love and relationship novels",
        "has_child": false,
        "parent_id": 15,
        "icon_name": "heart",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:25:00Z",
        "updated_at": "2026-01-01T10:25:00Z"
    },
    {
        "id": 19,
        "name": "Mystery",
        "description": "Crime and thriller novels",
        "has_child": false,
        "parent_id": 15,
        "icon_name": "search",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:25:00Z",
        "updated_at": "2026-01-01T10:25:00Z"
    },
    {
        "id": 20,
        "name": "Fantasy",
        "description": "Magical and fantasy worlds",
        "has_child": false,
        "parent_id": 15,
        "icon_name": "sparkles",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:25:00Z",
        "updated_at": "2026-01-01T10:25:00Z"
    },
    {
        "id": 21,
        "name": "Science Fiction",
        "description": "Futuristic and science-based fiction",
        "has_child": false,
        "parent_id": 15,
        "icon_name": "rocket",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:25:00Z",
        "updated_at": "2026-01-01T10:25:00Z"
    },

    {
        "id": 22,
        "name": "Technology",
        "description": "Technology magazines",
        "has_child": false,
        "parent_id": 4,
        "icon_name": "cpu",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:30:00Z",
        "updated_at": "2026-01-01T10:30:00Z"
    },
    {
        "id": 23,
        "name": "Fashion",
        "description": "Fashion and lifestyle magazines",
        "has_child": false,
        "parent_id": 4,
        "icon_name": "shirt",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:30:00Z",
        "updated_at": "2026-01-01T10:30:00Z"
    },
    {
        "id": 24,
        "name": "Business",
        "description": "Business and finance magazines",
        "has_child": false,
        "parent_id": 4,
        "icon_name": "briefcase",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:30:00Z",
        "updated_at": "2026-01-01T10:30:00Z"
    },

    {
        "id": 25,
        "name": "Picture Books",
        "description": "Illustrated books for kids",
        "has_child": false,
        "parent_id": 5,
        "icon_name": "image",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:35:00Z",
        "updated_at": "2026-01-01T10:35:00Z"
    },
    {
        "id": 26,
        "name": "Story Books",
        "description": "Fun and moral stories for children",
        "has_child": false,
        "parent_id": 5,
        "icon_name": "smile",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:35:00Z",
        "updated_at": "2026-01-01T10:35:00Z"
    },
    {
        "id": 27,
        "name": "Comics",
        "description": "Comic books and graphic novels",
        "has_child": false,
        "parent_id": 5,
        "icon_name": "comic",
        "is_active": true,
        "deleted_at": null,
        "created_at": "2026-01-01T10:35:00Z",
        "updated_at": "2026-01-01T10:35:00Z"
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rebookz');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        await Category.deleteMany();
        console.log('Categories Purged');

        await Category.insertMany(categories);
        console.log('Categories Imported!');

        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

importData();
