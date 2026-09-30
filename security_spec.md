# Security Specification - meimeicorner

## Data Invariants
1. **User Ownership**: A user document (`/users/{userId}`) can only be read or written by the authenticated user whose UID matches `{userId}`.
2. **UserId Immutability**: The `userId` field in the user document must match the document ID and must be immutable after creation.
3. **Stat Integrity**: `bot_stats` documents can only be updated via atomic increments/decrements. Total counts cannot be set arbitrarily.
4. **Verified Access**: Critical write operations require a verified email if available (though standard Google Login usually verifies email).

## The "Dirty Dozen" Payloads
1. **Unauthorized Read**: `GET /users/victim_uid` as `attacker_uid` -> `PERMISSION_DENIED`.
2. **Unauthorized Write**: `SET /users/victim_uid { ... }` as `attacker_uid` -> `PERMISSION_DENIED`.
3. **Identity Poisoning**: `CREATE /users/my_uid { userId: "victim_uid", ... }` -> `PERMISSION_DENIED`.
4. **Direct Stat Mutation**: `UPDATE /bot_stats/bot_1 { likesCount: 999999 }` -> `PERMISSION_DENIED`.
5. **ID Bloating**: `GET /bot_stats/a_very_long_string_over_128_chars` -> `PERMISSION_DENIED`.
6. **Collection Group Scraping**: `QUERY /users` (collection group) -> `PERMISSION_DENIED`.
7. **Unauthenticated Write**: `SET /users/some_uid` without `auth` -> `PERMISSION_DENIED`.
8. **Client Timestamp Spoofing**: `SET /users/my_uid { ..., updatedAt: 12345678 }` where `12345678` is not `request.time` -> `PERMISSION_DENIED`.
9. **Shadow Field Injection**: `UPDATE /users/my_uid { isVerifiedVendor: true }` (where `isVerifiedVendor` is not in schema) -> `PERMISSION_DENIED`.
10. **Resource Exhaustion**: `SET /users/my_uid { largeField: "1MB string..." }` -> `PERMISSION_DENIED`.
11. **Email Spoofing**: `GET /users/my_uid` with `auth.token.email_verified == false` -> `PERMISSION_DENIED` (if mandated).
12. **Stat Reset**: `UPDATE /bot_stats/bot_1 { chatCount: 0 }` -> `PERMISSION_DENIED`.

## Test Runner (Draft)
A `firestore.rules.test.ts` would normally be used here, but I will proceed to generate the rules based on these invariants.
