// src/auth/ability.ts
import { AbilityBuilder, PureAbility } from "@casl/ability";
import { pb } from "../pocketbase.js";

export async function defineAbilityFor(user) {
  const { can, rules } = new AbilityBuilder(PureAbility);

  let roleRecord;
  try {
    console.log(user);
    if (!user.role_id) {
      console.warn(`User ${user.email} has no role assigned`);
      return new PureAbility(rules);
    }

    // 1. Fetch the role record by relation id
    roleRecord = await pb.collection("role").getOne(user.role_id);

    if (!roleRecord) {
      console.warn(`Role not found for id "${user.role_id}"`);
      return new PureAbility(rules);
    }
  } catch (err) {
    console.error("Error fetching role:", err.message);
    return new PureAbility(rules);
  }

  let rolePermissions = [];
  try {
    // 2. Fetch permissions for this role via role_permissions table
    rolePermissions = await pb.collection("role_permissions").getFullList(200, {
      filter: `role_id="${roleRecord.id}"`,
      expand: "permission_id", // exact relation field name
    });

    console.log("Fetched rolePermissions:", rolePermissions);
  } catch (err) {
    console.error("Error fetching role permissions:", err.message);
  }

  // 3. Add rules to CASL
  rolePermissions.forEach((rp) => {
    const perm = rp.expand?.permission_id;
    if (perm && perm.action && perm.subject) {
      can(perm.action, perm.subject);
    } else {
      console.warn("No expanded permission for this row:", rp);
    }
  });

  return new PureAbility(rules);
}
