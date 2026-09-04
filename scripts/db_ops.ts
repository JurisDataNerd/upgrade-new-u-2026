import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const command = process.argv[2];
const backupsDir = path.resolve(process.cwd(), "backups");

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

function getTimestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

if (command === "backup") {
  const timestamp = getTimestamp();
  const targetFile = path.join(backupsDir, `genius_db_${timestamp}.sql`);
  console.log(`[*] Initiating PostgreSQL Backup...`);
  console.log(`[*] Target file: ${targetFile}`);

  try {
    execSync(`docker exec -t genius_postgres_dev pg_dump -U genius -d genius_2026 --clean --if-exists > "${targetFile}"`, {
      stdio: "inherit",
      shell: "powershell.exe",
    });
    const stats = fs.statSync(targetFile);
    console.log(`[OK] Backup completed successfully! (${(stats.size / 1024).toFixed(2)} KB)`);
  } catch (err: any) {
    console.error(`[ERROR] Backup failed:`, err.message);
    process.exit(1);
  }
} else if (command === "restore") {
  let fileToRestore = process.argv[3];

  if (!fileToRestore) {
    const files = fs
      .readdirSync(backupsDir)
      .filter((f) => f.startsWith("genius_db_") && f.endsWith(".sql"))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error(`[ERROR] No backup files found in ${backupsDir}`);
      process.exit(1);
    }
    fileToRestore = path.join(backupsDir, files[0]);
    console.log(`[*] No file specified, using latest: ${files[0]}`);
  }

  if (!fs.existsSync(fileToRestore)) {
    console.error(`[ERROR] File not found: ${fileToRestore}`);
    process.exit(1);
  }

  console.log(`[*] Restoring database from: ${fileToRestore}`);
  try {
    execSync(`Get-Content "${fileToRestore}" | docker exec -i genius_postgres_dev psql -U genius -d genius_2026`, {
      stdio: "inherit",
      shell: "powershell.exe",
    });
    console.log(`[OK] Database successfully restored!`);
  } catch (err: any) {
    console.error(`[ERROR] Restore failed:`, err.message);
    process.exit(1);
  }
} else {
  console.log(`Usage: bun run scripts/db_ops.ts [backup|restore] [optional_sql_file]`);
}
