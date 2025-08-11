import { Agent } from "aigne";

// Create an agent with template variables
const weatherAgent = new Agent({
  name: "Weather Info Agent",
  instructions: "Provide weather information for {{city}} in a structured JSON format.",
  variables: {
    city: "Jakarta"
  },
  schema: {
    type: "object",
    properties: {
      temperature: { type: "string", description: "Temperature in Celsius" },
      condition: { type: "string", description: "Weather condition (sunny, cloudy, etc.)" },
      humidity: { type: "string", description: "Humidity percentage" }
    },
    required: ["temperature", "condition", "humidity"]
  }
});

// Example function to run the agent
async function runExample() {
  console.log("Requesting weather info...");
  
  const result = await weatherAgent.run();
  
  console.log("Structured AI Response:");
  console.log(JSON.stringify(result, null, 2));
}

runExample().catch(console.error);
