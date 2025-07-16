export default function team2({ result }) {
  return {
    result: [
      ...result,
      {
        name: "team2",
        description: "Team 2 Agent",
        date: new Date().toISOString(),
      },
    ],
  };
}
