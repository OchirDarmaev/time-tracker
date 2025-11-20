import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const featuresDir = join(__dirname, "../../../../features");

function getFeatureFiles(): Array<{ name: string; displayName: string }> {
  try {
    const files = readdirSync(featuresDir)
      .filter((file) => file.endsWith(".feature"))
      .map((file) => {
        const name = file.replace(".feature", "");
        const displayName = name
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return { name, displayName };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    return files;
  } catch (error) {
    console.error("Error reading features directory:", error);
    return [];
  }
}

export function FeaturesListView(): JSX.Element {
  const features = getFeatureFiles();

  return (
    <div id="features-content" class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">
          Features
        </h1>
        <p class="text-sm" style="color: var(--text-secondary);">
          View all feature specifications
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <a
            href={`/features/${feature.name}`}
            class="p-4 rounded-lg transition-all duration-200"
            style="background-color: var(--bg-elevated); border: 1px solid var(--border); box-shadow: var(--shadow-sm); text-decoration: none;"
            onmouseover="this.style.boxShadow='var(--shadow-md)'; this.style.transform='translateY(-2px)'; this.style.borderColor='var(--accent)';"
            onmouseout="this.style.boxShadow='var(--shadow-sm)'; this.style.transform='translateY(0)'; this.style.borderColor='var(--border)';"
          >
            <h3 class="text-lg font-semibold mb-2" style="color: var(--text-primary);" safe>
              {feature.displayName}
            </h3>
            <p class="text-sm" style="color: var(--text-secondary);" safe>
              {feature.name}.feature
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
