# Remaining Membership Endpoints to Update

The following endpoints still use in-memory Maps and need Prisma migration:

1. **Cancel membership** (line 730) - uses `getPatientActiveMembership` and `membershipStore.set`
2. **Pause membership** (line 784) - uses `getPatientActiveMembership` and `membershipStore.set`
3. **Resume membership** (line 842) - uses `Array.from(membershipStore.values())`, `tiersStore.get`, `membershipStore.set`
4. **Get benefits** (line 903) - uses `getPatientActiveMembership` and `tiersStore.get`
5. **Redeem benefit** (line 943) - uses `getPatientActiveMembership`, `redemptionsStore.set`, `membershipStore.set`

All these need to:
- Replace `getPatientActiveMembership()` with `await getPatientActiveMembership()` (already async)
- Replace `membershipStore.set()` with `await prisma.patientMembership.update()`
- Replace `tiersStore.get()` with `await prisma.membershipTier.findUnique()` or use included relation
- Replace `redemptionsStore.set()` with `await prisma.benefitRedemption.create()`
- Replace `Array.from(membershipStore.values())` with `await prisma.patientMembership.findFirst()`
- Add try/catch error handling
- Convert enum values (status) to uppercase for DB, lowercase for response
