import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";
import RunDetailDrawer from "./components/run/RunDetailDrawer.tsx";
import type { RunData } from "./components/run/types.ts";
import { parseDuration } from "./utils/latency.ts";

interface RunResponse {
  id: string;
  name: string;
  input: string;
  output: string;
  error: string;
  startedAt: number;
  endedAt: number;
  children: RunResponse[];
}

interface RunsResponse {
  data: RunResponse[];
}

function App() {
  const [runs, setRuns] = useState<RunData[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<RunData | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/trace/tree")
      .then((res) => res.json() as Promise<RunsResponse>)
      .then(({ data }) => {
        const format = (run: RunResponse): RunData => ({
          ...run,
          output: JSON.parse(run.output),
          children: run.children.map(format),
        });
        const formatted = data.map(format);
        setRuns(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatTime = (ts?: number) => {
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleString();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff", p: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 5,
          p: 3,
          minHeight: 500,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Input</TableCell>
                <TableCell>Output</TableCell>
                <TableCell>Error</TableCell>
                <TableCell>Started At</TableCell>
                <TableCell>Ended At</TableCell>
                <TableCell>Latency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : runs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No Data
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => (
                  <TableRow
                    key={run.id}
                    hover
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedRun(run);
                      setDrawerOpen(true);
                    }}
                  >
                    <TableCell>{run.id}</TableCell>
                    <TableCell>{run.name}</TableCell>
                    <TableCell>{run.input}</TableCell>
                    <TableCell>{JSON.stringify(run.output)}</TableCell>
                    <TableCell>{run.error}</TableCell>
                    <TableCell>{formatTime(run.startedAt)}</TableCell>
                    <TableCell>{formatTime(run.endedAt)}</TableCell>
                    <TableCell>{parseDuration(run.startedAt, run.endedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <RunDetailDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRun(null);
        }}
        run={selectedRun}
      />
    </Box>
  );
}

export default App;
