export default function team3({ result }) {
  return {
    result: [
      ...result,
      {
        name: "team3",
        description: "Team 3 Agent",
        date: new Date().toISOString(),
      },
    ],
  };
}
