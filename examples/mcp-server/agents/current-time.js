export default function currentTime() {
  return {
    currentTime: new Date().toISOString(),
  };
}
