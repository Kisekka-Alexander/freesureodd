#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setupNewProject() {
  console.log("🚀 Next.js Starter Template Setup\n");

  try {
    const projectName = await question(
      "Enter your project name (kebab-case): "
    );
    const projectTitle = await question(
      'Enter your project title (e.g., "My Awesome App"): '
    );
    const description = await question("Enter project description: ");

    console.log("\n📝 Updating project files...\n");

    // Update package.json
    const packagePath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    packageJson.name = projectName;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log("✅ Updated package.json");

    // Update layout.tsx metadata
    const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
    let layoutContent = fs.readFileSync(layoutPath, "utf8");
    layoutContent = layoutContent.replace(
      /title: "Next\.js Starter Template"/,
      `title: "${projectTitle}"`
    );
    layoutContent = layoutContent.replace(
      /description: "A comprehensive Next\.js starter template[^"]*"/,
      `description: "${description}"`
    );
    fs.writeFileSync(layoutPath, layoutContent);
    console.log("✅ Updated layout metadata");

    // Update hero component
    const heroPath = path.join(process.cwd(), "src/components/hero.tsx");
    let heroContent = fs.readFileSync(heroPath, "utf8");
    heroContent = heroContent.replace(
      /Next\.js Starter[\s\S]*?Template/,
      projectTitle
    );
    heroContent = heroContent.replace(
      /A comprehensive starter template[^<]*/,
      description
    );
    fs.writeFileSync(heroPath, heroContent);
    console.log("✅ Updated hero component");

    // Update README.md
    const readmePath = path.join(process.cwd(), "README.md");
    let readmeContent = fs.readFileSync(readmePath, "utf8");
    readmeContent = readmeContent.replace(
      /# Next\.js Starter Template/,
      `# ${projectTitle}`
    );
    readmeContent = readmeContent.replace(
      /A comprehensive Next\.js starter template[^.]*\./,
      `${description}.`
    );
    fs.writeFileSync(readmePath, readmeContent);
    console.log("✅ Updated README.md");

    console.log("\n🎉 Project setup complete!");
    console.log(`\nYour project "${projectTitle}" is ready!`);
    console.log("\nNext steps:");
    console.log("1. Run: npm run dev");
    console.log("2. Visit: http://localhost:3000");
    console.log("3. Start building your amazing project!");
  } catch (error) {
    console.error("❌ Error setting up project:", error.message);
  } finally {
    rl.close();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupNewProject();
}

module.exports = { setupNewProject };
