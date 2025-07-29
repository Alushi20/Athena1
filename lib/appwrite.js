import { Client, Account, Databases, Storage } from "react-native-appwrite";

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '67bb632a001de339c317',
    dbId:"67bc1b9400215f978730",
    col:{
        usersCol: "users",
        mentorshipMatchesCol: "mentorshipMatches",
        mentorshipSessionsCol: "mentorshipSessions",
        mentorshipFeedbackCol: "mentorshipFeedback",
    },
    storageId: "663116970003f56e9c69"
};

const client = new Client();

client.setEndpoint(config.endpoint).setProject(config.projectId);

const account = new Account(client);
const storage = new Storage(client);
const database = new Databases(client);

export { account, storage, database, client };




// const fetch = require('node-fetch');
// const sdk = require("node-appwrite");

// module.exports = async function (req, res) {
//   // Get menteeId from request body
//   const { menteeId } = JSON.parse(req.body);

//   // Appwrite setup
//   const client = new sdk.Client()
//     .setEndpoint(process.env.APPWRITE_ENDPOINT)
//     .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
//     .setKey(process.env.APPWRITE_API_KEY);

//   const database = new sdk.Databases(client);

//   // 1. Fetch mentee profile
//   const mentee = await database.getDocument(
//     process.env.APPWRITE_DATABASE_ID,
//     process.env.APPWRITE_USERS_COLLECTION_ID,
//     menteeId
//   );

//   // 2. Fetch all mentors
//   const mentors = (await database.listDocuments(
//     process.env.APPWRITE_DATABASE_ID,
//     process.env.APPWRITE_USERS_COLLECTION_ID,
//     [sdk.Query.equal('role', 'mentor')]
//   )).documents;

//   // 3. Prepare text for embeddings
//   function profileText(user) {
//     return [
//       user.name,
//       user.bio,
//       (user.skills || []).join(', '),
//       (user.fieldsOfInterest || []).join(', '),
//       user.missionMatch,
//       user.stageAlignment,
//       user.energySync,
//       user.commitmentVibe,
//       (user.valuesChemistry || []).join(', ')
//     ].filter(Boolean).join('. ');
//   }

//   // 4. Get embeddings from OpenAI
//   async function getEmbedding(text) {
//     const response = await fetch("https://api.openai.com/v1/embeddings", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         input: text,
//         model: "text-embedding-ada-002"
//       })
//     });
//     const data = await response.json();
//     return data.data[0].embedding;
//   }

//   // 5. Calculate cosine similarity
//   function cosineSimilarity(a, b) {
//     const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
//     const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
//     const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
//     return dot / (magA * magB);
//   }

//   // 6. Get mentee embedding
//   const menteeEmbedding = await getEmbedding(profileText(mentee));

//   // 7. Get mentor embeddings and calculate scores
//   const mentorScores = [];
//   for (const mentor of mentors) {
//     const mentorEmbedding = await getEmbedding(profileText(mentor));
//     const score = cosineSimilarity(menteeEmbedding, mentorEmbedding);
//     mentorScores.push({
//       mentorId: mentor.$id,
//       name: mentor.name,
//       profilePic: mentor.profilePicUrl,
//       score
//     });
//   }

//   // 8. Sort mentors by score (descending)
//   mentorScores.sort((a, b) => b.score - a.score);

//   // 9. Return top matches
//   res.json({
//     matches: mentorScores.slice(0, 10)
//   });
// };