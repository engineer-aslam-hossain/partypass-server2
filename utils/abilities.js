const { AbilityBuilder, PureAbility } = require("@casl/ability");

const defineAbilitiesFor = (user) => {
  const { can, build } = new AbilityBuilder(PureAbility);

  can("read", "User");
  can("upload", "User");
  can("update", "User");
  can("delete", "User");
  if (user.role === 1) {
    can("manage", "all"); // Full control
  } else if (user.role === 2) {
    can("create", "Institution");
    can("manage", "TicketType");
    can("read", "Institution");
    can("update", "Institution"); // General update permission
    can("manage", "InstitutionalStaff");
    can("manage", "Locker");
    can("institute_list", "Purchase");
    can("read", "Purchase");
  } else if (user.role === 3) {
    can("read", "Event");
    can("update", "Event");
  } else if (user.role === 0) {
    can("create", "Purchase");
    can("read", "Purchase");
    can("purchase", "Ticket");
  }

  return build();
};

module.exports = defineAbilitiesFor;
