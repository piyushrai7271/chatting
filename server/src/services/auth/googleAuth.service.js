import User from "../../models/user.model.js";

export const findOrCreateGoogleUser = async (profile) => {
  try {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const fullName = profile.displayName;
    const avatar = profile.photos?.[0]?.value;

    if (!email) {
      throw new Error("Google did not provide an email.");
    }

    // 1. Find by googleId
    let user = await User.findOne({ googleId });
    if (user) return user;

    // 2. If a local user already exists with the same email → convert them
    user = await User.findOne({ email });
    if (user) {
      user.googleId = googleId;
      user.authProvider = "google";
      user.avatar = avatar;
      await user.save({ validateBeforeSave: false });
      return user;
    }

    // 3. Create new Google user
    const newUser = await User.create({
      googleId,
      fullName,
      email,
      avatar,
      authProvider: "google",
      password: null,
      mobileNumber: null,
    });

    return newUser;

  } catch (error) {
    console.error("Google Auth Error:", error.message);
    throw error; // let passport handle it
  }
};

