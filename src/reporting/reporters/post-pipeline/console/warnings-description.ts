// Import Third-party Dependencies
import * as i18n from "@nodesecure/i18n";
import * as jsxray from "@nodesecure/js-x-ray";
import { table } from "table";

// Import Internal Dependencies
import { consolePrinter } from "../../../../../lib/console-printer/index.js";
import { Nsci } from "../../../../configuration/standard/index.js";

export function printWarningsDescription(): void {
  const tableData = [
    [
      consolePrinter.font.standard("Warning label").bold().message,
      consolePrinter.font.standard("Warning description").bold().message
    ]
  ];
  for (const warningName of Nsci.warningNames) {
    tableData.push([
      warningName,
      consolePrinter.font.standard(
        i18n.getTokenSync(jsxray.warnings[warningName].i18n)
      ).message
    ]);
  }
  consolePrinter.font.standard(table(tableData)).print();
}
