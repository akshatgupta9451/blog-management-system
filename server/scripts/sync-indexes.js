// Brings the database's indexes in line with the schemas and backfills derived fields.
//   npm run sync-indexes
// Creates missing indexes and DROPS indexes that are no longer defined in a schema
// (e.g. the old {status, createdAt} index replaced by {status, createdAt, _id}).
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/user.model.js';
import { Blog } from '../src/models/blog.model.js';
import { Activity } from '../src/models/activity.model.js';
import { BlogLike } from '../src/models/blogLike.model.js';
import { Bookmark } from '../src/models/bookmark.model.js';
import { ReadingHistory } from '../src/models/readingHistory.model.js';
import { BlogView } from '../src/models/blogView.model.js';
import { Comment } from '../src/models/comment.model.js';
import { tokenizeName } from '../src/utils/search.js';

await connectDB();

for (const model of [User, Blog, Activity, BlogLike, Bookmark, ReadingHistory, BlogView, Comment]) {
  const dropped = await model.syncIndexes();
  console.log(
    `${model.modelName}: indexes in sync${dropped.length ? `, dropped ${dropped.join(', ')}` : ''}`
  );
}

// Users created before author search existed have no nameTokens yet
const users = await User.find({ nameTokens: { $exists: false } }, { name: 1 }).lean();
if (users.length) {
  await User.bulkWrite(
    users.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { nameTokens: tokenizeName(user.name) } },
      },
    }))
  );
}
console.log(`Backfilled nameTokens for ${users.length} user(s)`);

await mongoose.connection.close();
