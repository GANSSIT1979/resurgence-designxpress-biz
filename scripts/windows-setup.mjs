import { spawnSync } from "node:child_process";
import process from "node:process";

const steps = [
  ["npm", ["run", "doctor"]],
  ["npm", ["install"]],
  ["npm", ["run", "prisma:generate"]],
  ["npm", ["run", "db:push"]],
  ["npm", ["run", "db:seed"]]
];

for (const [command, args] of steps) {
  console.log(`\n[windows-setup] Running: ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\n[windows-setup] Local setup completed successfully.");
console.log("[windows-setup] Start the app with: npm run dev");
