import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db';
import User from './models/User';
import Book from './models/Book';
import Category from './models/Category';

dotenv.config();

const users = [
    {
        name: 'Ahmed Al-Saud',
        email: 'ahmed@example.com',
        phone: '0501234567',
        role: 'user',
        password: 'password123',
    },
    {
        name: 'Fatima Khan',
        email: 'fatima@example.com',
        phone: '0507654321',
        role: 'user',
        password: 'password123',
    }
];

const categories = [
    { id: 1, name: "Academic", description: "Educational and academic books", has_child: true, parent_id: null, icon_name: "school", is_active: true, color: "#4A90E2" },
    { id: 2, name: "Fiction", description: "Fictional stories and novels", has_child: true, parent_id: null, icon_name: "book", is_active: true, color: "#E24A4A" },
    { id: 3, name: "Non-Fiction", description: "Real-world and factual books", has_child: true, parent_id: null, icon_name: "library", is_active: true, color: "#F5A623" },
    { id: 4, name: "Magazines", description: "Periodicals and magazines", has_child: true, parent_id: null, icon_name: "newspaper", is_active: true, color: "#BD10E0" },
    { id: 5, name: "Children", description: "Books for kids and teens", has_child: true, parent_id: null, icon_name: "happy", is_active: true, color: "#50E3C2" },

    // Level 2 - Academic
    { id: 6, name: "School Books", description: "Books for classes 1 to 12", has_child: true, parent_id: 1, icon_name: "journal", is_active: true },
    { id: 7, name: "Competitive Exams", description: "Exam preparation books", has_child: true, parent_id: 1, icon_name: "ribbon", is_active: true },
    { id: 8, name: "College Textbooks", description: "Undergraduate and postgraduate books", has_child: false, parent_id: 1, icon_name: "school-outline", is_active: true },

    // Level 3 - School Books
    { id: 9, name: "Science", description: "Physics, Chemistry, Biology", has_child: false, parent_id: 6, icon_name: "flask", is_active: true },
    { id: 10, name: "Mathematics", description: "Mathematics textbooks", has_child: false, parent_id: 6, icon_name: "calculator", is_active: true },
    { id: 11, name: "Social Studies", description: "History, Civics, Geography", has_child: false, parent_id: 6, icon_name: "globe", is_active: true },

    // Level 3 - Competitive
    { id: 12, name: "UPSC", description: "Civil services exam books", has_child: false, parent_id: 7, icon_name: "business", is_active: true },
    { id: 13, name: "JEE", description: "Engineering entrance exam books", has_child: false, parent_id: 7, icon_name: "construct", is_active: true },
    { id: 14, name: "NEET", description: "Medical entrance exam books", has_child: false, parent_id: 7, icon_name: "medkit", is_active: true },

    // Level 2 - Fiction
    { id: 15, name: "Novels", description: "Fictional long stories", has_child: true, parent_id: 2, icon_name: "bookmark", is_active: true },
    { id: 16, name: "Short Stories", description: "Short fictional stories", has_child: false, parent_id: 2, icon_name: "document-text", is_active: true },
    { id: 17, name: "Poetry", description: "Poems and verses", has_child: false, parent_id: 2, icon_name: "rose", is_active: true },

    // Level 3 - Novels
    { id: 18, name: "Romance", description: "Love and relationship novels", has_child: false, parent_id: 15, icon_name: "heart", is_active: true },
    { id: 19, name: "Mystery", description: "Crime and thriller novels", has_child: false, parent_id: 15, icon_name: "search", is_active: true },
    { id: 20, name: "Fantasy", description: "Magical and fantasy worlds", has_child: false, parent_id: 15, icon_name: "planet", is_active: true },
    { id: 21, name: "Science Fiction", description: "Futuristic and science-based fiction", has_child: false, parent_id: 15, icon_name: "rocket", is_active: true },

    // Level 2 - Magazines
    { id: 22, name: "Technology", description: "Technology magazines", has_child: false, parent_id: 4, icon_name: "hardware-chip", is_active: true },
    { id: 23, name: "Fashion", description: "Fashion and lifestyle magazines", has_child: false, parent_id: 4, icon_name: "shirt", is_active: true },
    { id: 24, name: "Business", description: "Business and finance magazines", has_child: false, parent_id: 4, icon_name: "briefcase", is_active: true },

    // Level 2 - Children
    { id: 25, name: "Picture Books", description: "Illustrated books for kids", has_child: false, parent_id: 5, icon_name: "image", is_active: true },
    { id: 26, name: "Story Books", description: "Fun and moral stories for children", has_child: false, parent_id: 5, icon_name: "happy-outline", is_active: true },
    { id: 27, name: "Comics", description: "Comic books and graphic novels", has_child: false, parent_id: 5, icon_name: "chatbubbles", is_active: true },

    // New additions from user request (Art)
    { id: 28, name: "Art", description: "Art and Craft", has_child: true, parent_id: null, icon_name: "color-palette", is_active: true, color: "#9013FE" },
    { id: 29, name: "Sketch", description: "", has_child: false, parent_id: 28, icon_name: "pencil", is_active: true },
    { id: 30, name: "Color Book", description: "", has_child: false, parent_id: 28, icon_name: "brush", is_active: true },
    { id: 31, name: "Sketch Book", description: "", has_child: true, parent_id: 28, icon_name: "easel", is_active: true },

    // Level 3 - Sketch Book
    { id: 32, name: "Crayons Book", description: "", has_child: false, parent_id: 31, icon_name: "color-wand", is_active: true },

    // Olympiad
    { id: 33, name: "Olympiad Books", description: "", has_child: false, parent_id: 1, icon_name: "trophy", is_active: true }
];

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing Database...');
        await Book.deleteMany({});
        await User.deleteMany({ role: { $ne: 'admin' } });
        await Category.deleteMany({});

        console.log('Seeding Users...');
        const createdUsers = await User.create(users);
        const sellerId = createdUsers[0]._id;

        console.log('Seeding Categories...');
        // Insert with numeric IDs
        await Category.insertMany(categories);

        console.log('Seeding Books...');
        const books = [
            // --- Academic / School ---
            {
                title: 'NCERT Mathematics Class 5',
                author: 'NCERT',
                description: 'Standard textbook for class 5.',
                category: 'Class 1-5',
                condition: 'good',
                type: 'sell',
                price: 20,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh, Olaya' }, // Riyadh
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e']
            },
            {
                title: 'Science for Class 8',
                author: 'Lakhmir Singh',
                description: 'Physics, Chemistry and Biology.',
                category: 'Class 6-8',
                condition: 'like_new',
                type: 'sell',
                price: 35,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [39.1925, 21.4858], address: 'Jeddah, Al Hamra' }, // Jeddah
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765']
            },
            {
                title: 'Advanced Physics',
                author: 'H.C. Verma',
                description: 'Concepts of Physics Part 1 & 2',
                category: 'Science', // Mapped to Science subcat
                condition: 'good',
                type: 'sell',
                price: 50,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.7327, 24.6625], address: 'Riyadh, Malaz' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa']
            },
            {
                title: 'Mathematics for Class 7',
                author: 'R.D. Sharma',
                description: 'Comprehensive guide for middle school math.',
                category: 'Mathematics',
                condition: 'fair',
                type: 'rent',
                price: 10,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1517842645767-c639042777db']
            },

            // --- Competitive Exams ---
            {
                title: 'UPSC General Studies',
                author: 'McGraw Hill',
                description: 'Paper 1 Manual.',
                category: 'UPSC',
                condition: 'new',
                type: 'sell',
                price: 120,
                seller: createdUsers[0]._id,
                location: { type: 'Point', coordinates: [50.0888, 26.4207], address: 'Dammam' }, // Dammam
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8']
            },
            {
                title: 'JEE Main Prep Guide',
                author: 'Arihant',
                description: 'Complete guide for JEE Mains.',
                category: 'JEE',
                condition: 'good',
                type: 'sell',
                price: 80,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173']
            },
            {
                title: 'Biology for NEET',
                author: 'Trueman',
                description: 'Objective Biology.',
                category: 'NEET',
                condition: 'fair',
                type: 'donate',
                price: 0,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [39.1925, 21.4858], address: 'Jeddah' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14']
            },

            // --- College ---
            {
                title: 'Mechanical Engineering Design',
                author: 'Shigley',
                description: 'Standard handbook.',
                category: 'Engineering',
                condition: 'like_new',
                type: 'rent',
                price: 20, // Rent price
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1581092921461-eab62e97a782']
            },
            {
                title: 'Cost Accounting',
                author: 'Horngren',
                description: 'A Managerial Emphasis.',
                category: 'Accounting',
                condition: 'good',
                type: 'sell',
                price: 90,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [50.0888, 26.4207], address: 'Dammam' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c']
            },

            // --- Fiction ---
            {
                title: 'The Notebook',
                author: 'Nicholas Sparks',
                description: 'Classic romance.',
                category: 'Romance',
                condition: 'good',
                type: 'swap',
                price: 0,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [39.1925, 21.4858], address: 'Jeddah' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794']
            },
            {
                title: 'Da Vinci Code',
                author: 'Dan Brown',
                description: 'Mystery thriller.',
                category: 'Mystery',
                condition: 'like_new',
                type: 'sell',
                price: 40,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.7327, 24.6625], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e']
            },
            {
                title: 'Dune',
                author: 'Frank Herbert',
                description: 'Sci-fi masterpiece.',
                category: 'Science Fiction',
                condition: 'new',
                type: 'sell',
                price: 60,
                seller: createdUsers[0]._id,
                location: { type: 'Point', coordinates: [50.0888, 26.4207], address: 'Dammam' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1478720568477-152d9b164e63']
            },
            {
                title: 'Selected Short Stories',
                author: 'O. Henry',
                description: 'A collection of short stories.',
                category: 'Short Stories',
                condition: 'good',
                type: 'sell',
                price: 25,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba']
            },
            {
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                description: 'Classic fantasy novel.',
                category: 'Fantasy',
                condition: 'used',
                type: 'sell',
                price: 30,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [39.1925, 21.4858], address: 'Jeddah' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1521587765099-8835e7201186']
            },

            // --- Non-Fiction ---
            {
                title: 'Sapiens: A Brief History of Humankind',
                author: 'Yuval Noah Harari',
                description: 'Explores the history of humanity.',
                category: 'Non-Fiction',
                condition: 'like_new',
                type: 'sell',
                price: 55,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd87']
            },

            // --- Magazines ---
            {
                title: 'Wired Magazine',
                author: 'Conde Nast',
                description: 'Tech trends 2025.',
                category: 'Technology',
                condition: 'good',
                type: 'sell',
                price: 15,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1555449372-5b12cb73926e']
            },
            {
                title: 'Vogue Arabia',
                author: 'Conde Nast',
                description: 'Fashion special.',
                category: 'Fashion',
                condition: 'like_new',
                type: 'sell',
                price: 20,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [39.1925, 21.4858], address: 'Jeddah' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1551024601-5629c171e064']
            },
            {
                title: 'Forbes Middle East',
                author: 'Forbes',
                description: 'Business insights.',
                category: 'Business',
                condition: 'good',
                type: 'rent',
                price: 10,
                seller: createdUsers[0]._id,
                location: { type: 'Point', coordinates: [50.0888, 26.4207], address: 'Dammam' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf']
            },

            // --- Children ---
            {
                title: 'The Very Hungry Caterpillar',
                author: 'Eric Carle',
                description: 'Classic picture book.',
                category: 'Picture Books',
                condition: 'good',
                type: 'sell',
                price: 30,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [39.1925, 21.4858], address: 'Jeddah' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1519331379826-f9ba7b0a0db2']
            },
            {
                title: 'Spider-Man Comic',
                author: 'Marvel',
                description: 'Issue #100.',
                category: 'Comics',
                condition: 'good',
                type: 'sell',
                price: 25,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe']
            },
            {
                title: 'The Little Prince',
                author: 'Antoine de Saint-Exupéry',
                description: 'A timeless story for all ages.',
                category: 'Story Books',
                condition: 'like_new',
                type: 'sell',
                price: 35,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [39.1925, 21.4858], address: 'Jeddah' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f']
            },

            // --- Art & Sketch ---
            {
                title: 'Sketching 101',
                author: 'Artist Mike',
                description: 'Beginner guide.',
                category: 'Sketch',
                condition: 'new',
                type: 'sell',
                price: 45,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f']
            },
            {
                title: 'Mandala Coloring Book',
                author: 'Zen Art',
                description: 'Adult coloring book.',
                category: 'Color Book',
                condition: 'new',
                type: 'sell',
                price: 25,
                seller: createdUsers[0]._id,
                location: { type: 'Point', coordinates: [50.0888, 26.4207], address: 'Dammam' }, // Dammam
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1544816155-12df9643f363']
            },
            {
                title: 'Crayolia Crayons Set & Book',
                author: 'Crayola',
                description: 'Book with 24 crayons.',
                category: 'Crayons Book',
                condition: 'new',
                type: 'sell',
                price: 35,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.7327, 24.6625], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1515263487990-61b07816b324']
            },
            {
                title: 'The Art of Drawing',
                author: 'Giovanni Civardi',
                description: 'Comprehensive guide to drawing techniques.',
                category: 'Art',
                condition: 'like_new',
                type: 'sell',
                price: 60,
                seller: createdUsers[1]._id,
                location: { type: 'Point', coordinates: [39.1925, 21.4858], address: 'Jeddah' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1520052205864-c3fd096538cd']
            },

            // --- Others ---
            {
                title: 'Math Olympiad Prep',
                author: 'IMO',
                description: 'Previous year papers.',
                category: 'Olympiad Books',
                condition: 'fair',
                type: 'donate',
                price: 0,
                seller: sellerId,
                location: { type: 'Point', coordinates: [46.6753, 24.7136], address: 'Riyadh' },
                isAvailable: true,
                images: ['https://images.unsplash.com/photo-1596495578065-6e0763fa1178']
            }
        ];

        await Book.create(books);
        console.log('Database Re-seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
