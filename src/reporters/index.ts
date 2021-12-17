import { InterpretedPayload } from "../payload/interpret.js";

export type Reporter = {
  type: ReporterTarget;
  report: (payload: InterpretedPayload) => void;
};

export enum ReporterTarget {
  CONSOLE = "console",
  HTML = "html"
}
