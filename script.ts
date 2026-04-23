import { prisma } from "./lib/prisma";

async function main() {
  // Test: verify DB connection and list users
  const userCount = await prisma.user.count();
  console.log(`✅ Connected to database. User count: ${userCount}`);

  // Test: create a user (only if none exist)
  if (userCount === 0) {
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: "Test User",
        email: "test@intelliq.dev",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("✅ Created test user:", user);
  }

  const allUsers = await prisma.user.findMany();
  console.log(`✅ All users (${allUsers.length}):`, allUsers.map((u) => u.email));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
