# batchone
A full stack project for e-comm - this is backend part


Adding stars would be great, feel free to fork.
Please don't send pull request in this project.

This project is a part of my live bootcamp - Batch 1.

[Course link](http://hc.lco.dev/jscamp)

## authRoles.middleware.js || Added Features

```
import CustomError from "../utils/customError";
import asyncHandler from "../services/asyncHandler";

export const hasRoles = asyncHandler((...permittedRoles) => {
     
      // Middleware for doing Role-Based Permissions

     // Return Middleware
    return (req, _res, next) => {

        // Taking Out user from Request
        const {user} = req;

        // Checking Whether user role is in the permittedRoles List
        if (!user && !permittedRoles.includes(user.role)){
            throw new CustomError("Forbidden", 403);  // user is Forbidden
        };

        next(); // Role is Allowed, So Continue on the Next Middleware
    };
});
```