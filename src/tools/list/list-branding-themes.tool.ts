import { listXeroBrandingThemes } from "../../handlers/list-xero-branding-themes.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const ListBrandingThemesTool = CreateXeroTool(
  "list-branding-themes",
  "Lists all branding themes in Xero. Use this tool to get the branding theme IDs to be used when creating invoices, quotes, purchase orders, or credit notes in Xero.",
  {},
  async () => {
    const response = await listXeroBrandingThemes();
    if (response.error !== null) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing branding themes: ${response.error}`,
          },
        ],
      };
    }

    const brandingThemes = response.result;

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${brandingThemes?.length || 0} branding themes:`,
        },
        ...(brandingThemes?.map((theme) => ({
          type: "text" as const,
          text: [
            `Branding Theme ID: ${theme.brandingThemeID || "Unknown"}`,
            `Name: ${theme.name || "Unnamed"}`,
            theme.type ? `Type: ${theme.type}` : null,
            theme.sortOrder !== undefined
              ? `Sort Order: ${theme.sortOrder}${theme.sortOrder === 0 ? " (Default)" : ""}`
              : null,
            theme.logoUrl ? `Logo URL: ${theme.logoUrl}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        })) || []),
      ],
    };
  },
);

export default ListBrandingThemesTool;
