import assert from "assert";
import { calculateProfileCompleteness } from "../lib/profile";
import { isAdmin, isAthlete, isRecruiter } from "../lib/permissions";
import { UserRole } from "@prisma/client";

function runTests() {
  console.log("Running unit tests...");

  // isAdmin
  assert.strictEqual(isAdmin({ id: "1", email: "a@b.com", role: UserRole.ADMIN }), true);
  assert.strictEqual(isAdmin({ id: "2", email: "a@b.com", role: UserRole.SUPER_ADMIN }), true);
  assert.strictEqual(isAdmin({ id: "3", email: "a@b.com", role: UserRole.ATHLETE }), false);
  assert.strictEqual(isAdmin(null), false);

  // isAthlete
  assert.strictEqual(isAthlete({ id: "1", email: "a@b.com", role: UserRole.ATHLETE }), true);
  assert.strictEqual(isAthlete({ id: "2", email: "a@b.com", role: UserRole.ADMIN }), false);

  // isRecruiter
  assert.strictEqual(isRecruiter({ id: "1", email: "a@b.com", role: UserRole.RECRUITER }), true);
  assert.strictEqual(isRecruiter({ id: "2", email: "a@b.com", role: UserRole.ADMIN }), true);
  assert.strictEqual(isRecruiter({ id: "3", email: "a@b.com", role: UserRole.ATHLETE }), false);

  // Profile Completeness
  const user = { firstName: "Jordan", email: "jordan@example.com" };
  const emptyProfile = {
    schoolClub: null,
    graduationYear: null,
    location: null,
    sport: null,
    position: null,
    bio: null,
    profilePhoto: null,
  };
  assert.strictEqual(calculateProfileCompleteness(user, emptyProfile), 20);

  const fullProfile = {
    schoolClub: "Mater Dei",
    graduationYear: 2026,
    location: "Los Angeles, CA",
    sport: "football",
    position: "Quarterback",
    bio: "Top prospect",
    profilePhoto: "photo.jpg",
  };
  assert.strictEqual(calculateProfileCompleteness(user, fullProfile), 100);

  console.log("All unit tests passed successfully!");
}

runTests();
