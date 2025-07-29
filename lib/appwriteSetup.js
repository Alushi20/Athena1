const { Client, Databases, ID, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID;

const collections = [
    {
        id: 'mentorshipMatches',
        name: 'MentorshipMatches',
        attributes: [
            { id: 'mentorId', type: 'string', size: 255, required: true },
            { id: 'menteeId', type: 'string', size: 255, required: true },
            { id: 'status', type: 'string', size: 50, required: true, default: 'pending' }, // pending, active, completed, cancelled
            { id: 'matchedOn', type: 'datetime', required: true },
            { id: 'fieldsMatchedOn', type: 'string', size: 255, required: false, array: true },
            { id: 'aiScore', type: 'double', required: false },
        ],
        indexes: [
            { id: 'mentorId_index', type: 'key', attributes: ['mentorId'], order: 'ASC' },
            { id: 'menteeId_index', type: 'key', attributes: ['menteeId'], order: 'ASC' },
        ]
    },
    {
        id: 'mentorshipSessions',
        name: 'MentorshipSessions',
        attributes: [
            { id: 'matchId', type: 'string', size: 255, required: true },
            { id: 'scheduledTime', type: 'datetime', required: true },
            { id: 'meetingLink', type: 'string', size: 1024, required: false },
            { id: 'status', type: 'string', size: 50, required: true, default: 'upcoming' }, // upcoming, completed, cancelled
            { id: 'feedbackGiven', type: 'boolean', required: true, default: false },
        ],
        indexes: [
            { id: 'matchId_index', type: 'key', attributes: ['matchId'], order: 'ASC' },
        ]
    },
    {
        id: 'mentorshipFeedback',
        name: 'MentorshipFeedback',
        attributes: [
            { id: 'sessionId', type: 'string', size: 255, required: true },
            { id: 'menteeId', type: 'string', size: 255, required: true },
            { id: 'mentorId', type: 'string', size: 255, required: true },
            { id: 'rating', type: 'integer', required: true, min: 1, max: 5 },
            { id: 'comment', type: 'string', size: 4096, required: false },
            { id: 'private', type: 'boolean', required: true, default: false },
        ],
        indexes: [
            { id: 'sessionId_index', type: 'key', attributes: ['sessionId'], order: 'ASC' },
            { id: 'mentorId_index', type: 'key', attributes: ['mentorId'], order: 'ASC' },
        ]
    },
    {
        id: 'mentorAvailability',
        name: 'MentorAvailability',
        attributes: [
            { id: 'mentorId', type: 'string', size: 255, required: true },
            { id: 'date', type: 'string', size: 100, required: true },
            { id: 'time', type: 'string', size: 100, required: true },
            { id: 'reserved', type: 'boolean', required: true, default: false },
        ],
        indexes: [
            { id: 'mentorId_index', type: 'key', attributes: ['mentorId'], order: 'ASC' },
        ]
    }
];

async function setupDatabase() {
    for (const collection of collections) {
        try {
            await databases.getCollection(dbId, collection.id);
            console.log(`Collection "${collection.name}" already exists.`);
        } catch (error) {
            console.log(`Creating collection "${collection.name}"...`);
            await databases.createCollection(dbId, collection.id, collection.name, [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]);
            console.log(`Collection "${collection.name}" created.`);
        }

        for (const attr of collection.attributes) {
            try {
                await databases.getAttribute(dbId, collection.id, attr.id);
            } catch (error) {
                console.log(`Creating attribute "${attr.id}" in "${collection.name}"...`);
                switch (attr.type) {
                    case 'string':
                        await databases.createStringAttribute(dbId, collection.id, attr.id, attr.size, attr.required, attr.default, attr.array);
                        break;
                    case 'datetime':
                        await databases.createDatetimeAttribute(dbId, collection.id, attr.id, attr.required, attr.default, attr.array);
                        break;
                    case 'integer':
                        await databases.createIntegerAttribute(dbId, collection.id, attr.id, attr.required, attr.min, attr.max, attr.default, attr.array);
                        break;
                    case 'double':
                        await databases.createFloatAttribute(dbId, collection.id, attr.id, attr.required, attr.min, attr.max, attr.default, attr.array);
                        break;
                    case 'boolean':
                        await databases.createBooleanAttribute(dbId, collection.id, attr.id, attr.required, attr.default, attr.array);
                        break;
                }
                console.log(`Attribute "${attr.id}" created.`);
            }
        }
        
        // Wait a bit before creating indexes to ensure attributes are ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        for (const index of collection.indexes) {
            try {
                await databases.getIndex(dbId, collection.id, index.id);
            } catch (error) {
                console.log(`Creating index "${index.id}" in "${collection.name}"...`);
                await databases.createIndex(dbId, collection.id, index.id, index.type, index.attributes, [index.order]);
                console.log(`Index "${index.id}" created.`);
            }
        }
    }
    console.log('Database setup completed successfully.');
}

setupDatabase().catch(console.error); 