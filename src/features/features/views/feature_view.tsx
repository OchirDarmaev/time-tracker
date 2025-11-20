import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const featuresDir = join(__dirname, "../../../../features");

function parseFeatureFileSync(content: string): {
  title: string;
  description: string;
  scenarios: Array<{ title: string; steps: Array<{ keyword: string; text: string }> }>;
} {
  const lines = content.split("\n");
  let title = "";
  let description = "";
  const scenarios: Array<{
    title: string;
    steps: Array<{ keyword: string; text: string }>;
  }> = [];
  let currentScenario: { title: string; steps: Array<{ keyword: string; text: string }> } | null =
    null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("Feature:")) {
      title = line.replace("Feature:", "").trim();
    } else if (line.startsWith("As ") || line.startsWith("I ") || line.startsWith("So ")) {
      if (description) description += " ";
      description += line;
    } else if (line.startsWith("Scenario:") || line.startsWith("Scenario Outline:")) {
      if (currentScenario) {
        scenarios.push(currentScenario);
      }
      currentScenario = {
        title: line.replace(/^Scenario( Outline)?:/, "").trim(),
        steps: [],
      };
    } else if (
      currentScenario &&
      (line.startsWith("Given ") ||
        line.startsWith("When ") ||
        line.startsWith("Then ") ||
        line.startsWith("And ") ||
        line.startsWith("But "))
    ) {
      const keyword = line.split(" ")[0];
      const text = line.substring(keyword.length).trim();
      currentScenario.steps.push({ keyword, text });
    }
  }

  if (currentScenario) {
    scenarios.push(currentScenario);
  }

  return { title, description, scenarios };
}

export function FeatureView(featureName: string): JSX.Element | null {
  const featurePath = join(featuresDir, `${featureName}.feature`);

  if (!existsSync(featurePath)) {
    return null;
  }

  try {
    const content = readFileSync(featurePath, "utf-8");
    // For now, use simple parsing. Gherkin parser is async and would require making the view async
    // which complicates the router. We'll use a simpler synchronous parser.
    const { title, description, scenarios } = parseFeatureFileSync(content);

    return (
      <div id="feature-content" class="space-y-6">
        <div class="flex items-center gap-4">
          <a
            href="/features"
            class="px-3 py-2 rounded-lg transition-all duration-200"
            style="color: var(--text-secondary); background-color: var(--bg-elevated); border: 1px solid var(--border);"
            onmouseover="this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-tertiary)';"
            onmouseout="this.style.color='var(--text-secondary)'; this.style.backgroundColor='var(--bg-elevated)';"
          >
            ← Back to Features
          </a>
        </div>

        <div>
          <h1 class="text-3xl font-bold mb-2" style="color: var(--text-primary);">
            <span safe>{title || featureName}</span>
          </h1>
          {description && (
            <p class="text-base mt-2" style="color: var(--text-secondary);" safe>
              {description}
            </p>
          )}
        </div>

        <div class="space-y-6">
          {scenarios.map((scenario, idx) => (
            <div
              class="p-4 rounded-lg"
              style="background-color: var(--bg-elevated); border: 1px solid var(--border);"
            >
              <h2 class="text-xl font-semibold mb-3" style="color: var(--text-primary);">
                Scenario {idx + 1}: <span safe>{scenario.title}</span>
              </h2>
              <div class="space-y-2">
                {scenario.steps.map((step) => {
                  const stepType = step.keyword;
                  const stepContent = step.text;
                  const stepColor =
                    stepType === "Given"
                      ? "var(--info)"
                      : stepType === "When"
                        ? "var(--accent)"
                        : stepType === "Then"
                          ? "var(--success)"
                          : "var(--text-secondary)";

                  return (
                    <div class="flex items-start gap-3">
                      <span
                        class="font-semibold text-sm"
                        style={`color: ${stepColor}; min-width: 60px;`}
                        safe
                      >
                        {stepType}
                      </span>
                      <span class="text-sm flex-1" style="color: var(--text-primary);" safe>
                        {stepContent}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div
          class="p-4 rounded-lg mt-6"
          style="background-color: var(--bg-secondary); border: 1px solid var(--border);"
        >
          <h3 class="text-sm font-semibold mb-2" style="color: var(--text-primary);">
            Raw Feature File
          </h3>
          <pre
            class="text-xs overflow-x-auto"
            style="color: var(--text-secondary); font-family: monospace; white-space: pre-wrap;"
            safe
          >
            {content}
          </pre>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error reading feature file:", error);
    return null;
  }
}
