import { db } from "../src/lib/db";
import fs from "fs/promises";
import path from "path";

async function main() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await fs.mkdir(uploadsDir, { recursive: true });

  const users = await db.user.findMany({
    include: { athleteProfile: true },
  });

  console.log(`Scanning ${users.length} users for oversized base64 avatars...`);

  for (const u of users) {
    const rawImage = u.image || u.athleteProfile?.profilePhoto;
    if (rawImage && rawImage.startsWith("data:image/")) {
      const commaIdx = rawImage.indexOf(",");
      if (commaIdx !== -1) {
        const meta = rawImage.slice(0, commaIdx);
        const base64Data = rawImage.slice(commaIdx + 1);
        const mimeMatch = meta.match(/data:image\/([a-zA-Z0-9+]+)/);
        const ext = mimeMatch && mimeMatch[1] === "png" ? ".png" : mimeMatch && mimeMatch[1] === "webp" ? ".webp" : ".jpg";
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `avatar-${u.id}${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        await fs.writeFile(filePath, buffer);
        const url = `/uploads/avatars/${fileName}`;

        await db.user.update({
          where: { id: u.id },
          data: { image: url },
        });

        if (u.athleteProfile) {
          await db.athleteProfile.update({
            where: { id: u.athleteProfile.id },
            data: { profilePhoto: url },
          });
        }
        console.log(`Migrated avatar for ${u.email} (${(buffer.length / 1024).toFixed(1)} KB) -> ${url}`);
      }
    }
  }
  console.log("Avatar migration complete!");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
