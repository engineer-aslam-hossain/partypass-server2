// authorize.js
// const logger = require("../lib/logger");
const defineAbilitiesFor = require("./abilities");
const { ForbiddenError } = require("@casl/ability");

function authorize(action, resource) {
  return (req, res, next) => {
    try {
      const user = req.user;
      const ability = defineAbilitiesFor(user);

      // Check CASL general permissions for the specified action and resource
      ForbiddenError.from(ability).throwUnlessCan(action, resource);

      // If there's a dynamic parameter (e.g., :id), check if it's authorized
      const resourceId = req.params.id ? parseInt(req.params.id, 10) : null;

      // Handle ID-based checks for specific resources
      if (user.role === 1) {
        // do nothing
      } else if (resourceId) {
        switch (resource) {
          case "Institution":
            if (user.institution_id !== resourceId) {
              // logger.error({
              //   label: "error",
              //   message: "Access denied: Unauthorized institution",
              //   methodName: "authorize",
              //   filepath: "authorize.js",
              //   payload: JSON.stringify(resource),
              // });

              return res
                .status(403)
                .json({ message: "Access denied: Unauthorized institution" });
            }
            break;

          // case "Purchase":
          //   if (user.institution_id !== resourceId) {
          //     logger.error({
          //       label: "error",
          //       message: "Access denied: Unauthorized institution",
          //       methodName: "authorize",
          //       filepath: "authorize.js",
          //       payload: JSON.stringify(resource),
          //     });

          //     return res
          //       .status(403)
          //       .json({ message: "Access denied: Unauthorized institution" });
          //   }
          //   break;

          default:
            break;
        }
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        // logger.error({
        //   label: "error",
        //   message: "Access denied",
        //   methodName: "authorize",
        //   filepath: "authorize.js",
        //   payload: JSON.stringify(resource),
        // });
        return res.status(403).json({ message: "Access denied" });
      } else {
        // logger.error({
        //   label: "error",
        //   message: error?.message,
        //   methodName: "authorize",
        //   filepath: "authorize.js",
        //   payload: JSON.stringify(resource),
        // });
        next(error);
      }
    }
  };
}

module.exports = authorize;
