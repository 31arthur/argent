import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Default categories
const defaultCategories = [
    // Expense categories
    { key: 'groceries', type: 'EXPENSE', icon: '🛒', color: '#4CAF50' },
    { key: 'food', type: 'EXPENSE', icon: '🍔', color: '#FF9800' },
    { key: 'transport', type: 'EXPENSE', icon: '🚗', color: '#2196F3' },
    { key: 'shopping', type: 'EXPENSE', icon: '🛍️', color: '#E91E63' },
    { key: 'entertainment', type: 'EXPENSE', icon: '🎬', color: '#9C27B0' },
    { key: 'bills', type: 'EXPENSE', icon: '💡', color: '#F44336' },
    { key: 'health', type: 'EXPENSE', icon: '⚕️', color: '#00BCD4' },
    { key: 'education', type: 'EXPENSE', icon: '📚', color: '#3F51B5' },
    { key: 'travel', type: 'EXPENSE', icon: '✈️', color: '#009688' },
    { key: 'utilities', type: 'EXPENSE', icon: '🔌', color: '#607D8B' },
    { key: 'rent', type: 'EXPENSE', icon: '🏠', color: '#795548' },
    { key: 'insurance', type: 'EXPENSE', icon: '🛡️', color: '#FF5722' },
    { key: 'clothing', type: 'EXPENSE', icon: '👕', color: '#E91E63' },
    { key: 'gifts', type: 'EXPENSE', icon: '🎁', color: '#9C27B0' },
    { key: 'personal', type: 'EXPENSE', icon: '👤', color: '#607D8B' },
    { key: 'other', type: 'EXPENSE', icon: '📦', color: '#9E9E9E' },

    // Income categories
    { key: 'salary', type: 'INCOME', icon: '💰', color: '#4CAF50' },
    { key: 'freelance', type: 'INCOME', icon: '💼', color: '#2196F3' },
    { key: 'investment', type: 'INCOME', icon: '📈', color: '#00BCD4' },
    { key: 'bonus', type: 'INCOME', icon: '🎉', color: '#FF9800' },
    { key: 'gift', type: 'INCOME', icon: '🎁', color: '#E91E63' },
    { key: 'refund', type: 'INCOME', icon: '↩️', color: '#009688' },
    { key: 'other', type: 'INCOME', icon: '💵', color: '#9E9E9E' },
];

async function populateCategories(userId: string) {
    console.log(`Populating categories for user: ${userId}`);

    const batch = db.batch();

    for (const category of defaultCategories) {
        const docRef = db.collection('categories').doc();
        batch.set(docRef, {
            ...category,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    await batch.commit();
    console.log(`✅ Created ${defaultCategories.length} categories for user ${userId}`);
}

// Get userId from command line argument
const userId = process.argv[2];

if (!userId) {
    console.error('❌ Error: Please provide a userId as argument');
    console.log('Usage: npm run populate-categories <userId>');
    process.exit(1);
}

populateCategories(userId)
    .then(() => {
        console.log('✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
