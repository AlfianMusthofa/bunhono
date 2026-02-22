import { Event } from "./event.model";
import { Category } from "./category.model";
import { Mentor } from "./mentor.model";
import { User } from "./user.model";
import { EventParticipantModel } from "./eventParticipant.model";
import { RefreshToken } from "./refreshToken.model";
import { EventStatus } from "./eventStatus.model";

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

export { Event, Mentor, Category };
