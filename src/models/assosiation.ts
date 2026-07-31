import { Event } from "./event.model";
import { Category } from "./category.model";
import { Mentor } from "./mentor.model";
import { User } from "./user.model";
import { EventParticipantModel } from "./eventParticipant.model";
import { RefreshToken } from "./refreshToken.model";
import { EventStatus } from "./eventStatus.model";
import { Certificate } from "./certificate.model";
import { Article } from "./article.model";
import { Tags } from "./tags.model";
import { Like } from "./like.model";
import { Comment } from "./comment.model";
import { Review } from "./review.model";
import { Organizers } from "./organizers.model";
import { EventFAQ } from "./eventFaq.model";

Category.hasMany(Event, {
  foreignKey: "categoryId",
});

Mentor.hasMany(Event, {
  foreignKey: "mentorId",
});

Event.belongsTo(Category, {
  foreignKey: "categoryId",
});

Event.belongsTo(Mentor, {
  foreignKey: "mentorId",
});

// Many to Many

User.belongsToMany(Event, {
  through: EventParticipantModel,
  foreignKey: "userId",
  otherKey: "eventId",
});

Event.belongsToMany(User, {
  through: EventParticipantModel,
  foreignKey: "eventId",
  otherKey: "userId",
});

User.hasMany(RefreshToken, { foreignKey: "userId" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

EventStatus.hasMany(Event, {
  foreignKey: "statusId",
  as: "events",
});

Event.belongsTo(EventStatus, {
  foreignKey: "statusId",
  as: "status",
});

Event.hasMany(EventParticipantModel, {
  foreignKey: "eventId",
});

EventParticipantModel.belongsTo(Event, {
  foreignKey: "eventId",
});

EventParticipantModel.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(EventParticipantModel, {
  foreignKey: "userId",
});

Event.hasMany(Certificate, { foreignKey: "eventId" });

Certificate.belongsTo(Event, { foreignKey: "eventId" });

EventParticipantModel.hasOne(Certificate, { foreignKey: "participantId" });

Certificate.belongsTo(EventParticipantModel, { foreignKey: "participantId" });

Article.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Article, { foreignKey: "categoryId" });

User.hasMany(Like, { foreignKey: "userId" });
Like.belongsTo(User, { foreignKey: "userId" });

Article.hasMany(Like, { foreignKey: "articleId" });
Like.belongsTo(Article, { foreignKey: "articleId" });

User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });

Article.hasMany(Comment, { foreignKey: "articleId" });
Comment.belongsTo(Article, {
  foreignKey: "articleId",
});

Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" });

Review.belongsTo(User, { foreignKey: "userId", as: "user" });
Review.belongsTo(Event, { foreignKey: "eventId", as: "event" });
User.hasMany(Review, { foreignKey: "userId" });
Event.hasMany(Review, { foreignKey: "eventId" });

Organizers.hasMany(Event, { foreignKey: "organizerId" });
Event.belongsTo(Organizers, { foreignKey: "organizerId" });

Event.hasMany(EventFAQ, { foreignKey: "eventId" });
EventFAQ.belongsTo(Event, { foreignKey: "eventId" });

export { Event, Mentor, Category };
