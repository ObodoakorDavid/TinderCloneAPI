const UserProfile = require("../models/userProfile"); // Import your UserProfile model

async function getAllMatches(userId, query) {
  const { numOfPhotos, gender, interest } = query;
  const excludedFields = [
    "-isVerified",
    "-createdAt",
    "-updatedAt",
    "-__v",
    "-liked",
    "-starred",
  ];

  let queryOptions = { _id: { $ne: userId } };

  // Apply additional query options based on gender and interest
  if (gender) {
    queryOptions.gender = gender; // Assuming gender field exists in UserProfile schema
  }

  if (interest) {
    queryOptions.interest = {
      $in: interest.split(",").map((interest) => interest.toLowerCase()),
    }; // Assuming interest field exists in UserProfile schema
  }

  console.log(queryOptions);

  let users = await UserProfile.find({
    ...queryOptions,
  })
    .populate({
      path: "userId",
      select: ["firstName", "lastName"],
    })
    .select(excludedFields);

  if (numOfPhotos) {
    users = users.filter((user) => user.photos.length >= Number(numOfPhotos));
  }

  return users;
}

module.exports = { getAllMatches };
