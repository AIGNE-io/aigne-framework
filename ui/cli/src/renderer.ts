/**
 * CLI renderer for AIGNE UI components using Ink
 */
import type { OnComponentShowCallback } from "@aigne/ui";
import { render } from "ink";

/**
 * Creates a CLI renderer callback that uses Ink to render and unmount components
 * This handles the render/unmount lifecycle for CLI environments
 *
 * @param delayMs - Optional delay in milliseconds before unmounting (default: 100)
 * @returns OnComponentShowCallback that can be passed to UIAgent
 */
export function createCLIRenderer(delayMs = 100): OnComponentShowCallback {
  return async (output) => {
    if (!output.element) {
      return;
    }

    let unmount: (() => void) | undefined;

    try {
      // Render the Ink component
      const result = render(output.element);
      unmount = result.unmount;

      // Wait for rendering to complete
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error("❌ CLI Render error:", error);
    } finally {
      // Ensure unmount is always called to release terminal control
      if (unmount) {
        try {
          unmount();
        } catch (error) {
          console.error("❌ CLI Unmount error:", error);
        }
      }
    }
  };
}
