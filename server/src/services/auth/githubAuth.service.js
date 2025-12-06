import User from "../../models/user.model.js";

export const findOrCreateGithubUser = async (profile) => {
  try {
    const githubId = profile.id;
    const fullName = profile.displayName || profile.username;
    const avatar = profile.photos?.[0]?.value;

    // Try to get email
    let email = null;
    if (profile.emails && profile.emails.length > 0) {
      email = profile.emails[0].value;
    }

    // If no email, generate a dummy email
    if (!email) {
      email = `github_user_${githubId}@github.local`;
    }

    // 1. Find user by GitHub ID
    let user = await User.findOne({ githubId });
    if (user) return user;

    // 2. If the email exists in local DB, merge accounts
    user = await User.findOne({ email });
    if (user) {
      user.githubId = githubId;
      user.authProvider = "github";
      user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
      return user;
    }

    // 3. Create new GitHub-only user
    const newUser = await User.create({
      githubId,
      fullName,
      email,
      avatar,
      authProvider: "github",
      password: null,
      mobileNumber: null,
    });

    return newUser;

  } catch (error) {
    console.error("GitHub Auth Error:", error.message);
    throw error;
  }
};


// export const findOrCreateGithubUser = async (profile) => {
//   try {
//     const githubId = profile.id;
//     const fullName = profile.displayName || profile.username;
//     const email = profile.emails?.[0]?.value; // may be null sometimes!
//     const avatar = profile.photos?.[0]?.value;

//     let user = null;

//     // 1. If GitHub ID already exists → login
//     user = await User.findOne({ githubId });
//     if (user) return user;

//     // 2. If GitHub didn’t return email (happens if email is private)
//     if (!email) {
//       throw new Error("GitHub did not provide an email.");
//     }

//     // 3. If local user already exists with same email → convert
//     user = await User.findOne({ email });
//     if (user) {
//       user.githubId = githubId;
//       user.authProvider = "github";
//       user.avatar = avatar;
//       await user.save({ validateBeforeSave: false });
//       return user;
//     }

//     // 4. Create brand new GitHub user
//     const newUser = await User.create({
//       githubId,
//       fullName,
//       email,
//       avatar,
//       authProvider: "github",
//       password: null,
//       mobileNumber: null,
//     });

//     return newUser;
//   } catch (error) {
//     console.error("GitHub Auth Error:", error.message);
//     throw error;
//   }
// };
