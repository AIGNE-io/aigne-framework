import {WsClient} from "@arcblock/ws"
import {useEffect} from "react"

let client: any

function create() {
  const currentURL = new URL(window.location.origin)

  if (process.env.NODE_ENV === "development") {
    currentURL.port = "7890"
  }

  const url = "//localhost:7890".replace(/\/$/, "")
  console.log(url)

  return new WsClient(url, {heartbeatIntervalMs: 10 * 1000})
}

export default function getWsClient() {
  if (!client) {
    client = create()
  }

  return client
}

export const useSubscription = (event: string, cb = () => {}, deps = []) => {
  if (!client) {
    client = getWsClient()
  }

  useEffect(() => {
    if (event) client.on(event, cb)

    return () => {
      if (event) client.off(event, cb)
    }
  }, [...deps, event, cb])
}
