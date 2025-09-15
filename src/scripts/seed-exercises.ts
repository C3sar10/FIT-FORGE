import axios from "axios";
import { docClient, PutCommand } from "@/lib/dynamodb";

async function seedExercises() {
  try {
    const response = await axios.get(
      "https://wger.de/api/v2/exercise/?limit=100&language=2"
    ); // English exercises
    const exercises = response.data.results;

    for (const exercise of exercises) {
      const exerciseId = `EXERCISE#${exercise.id}`;
      await docClient.send(
        new PutCommand({
          TableName: "FitForgeData",
          Item: {
            entityId: exerciseId,
            sortKey: "METADATA",
            userId: "SYSTEM", // System-owned for library
            entityType: "EXERCISE",
            createdAt: new Date().toISOString(),
            data: {
              title: exercise.name,
              description: exercise.description || "No description",
              tags: [exercise.category?.name || "general"],
              sets: 3, // Default for MVP
              reps: 10, // Default
              mediaUrl: "", // Add S3 later
              metadata: { source: "wger.de", shared: true },
            },
          },
        })
      );
      console.log(`Seeded exercise: ${exercise.name}`);
    }
    console.log("Seeding complete");
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

seedExercises();
