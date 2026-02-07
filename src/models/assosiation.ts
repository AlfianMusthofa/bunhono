import { Event } from "./event.model";
import { Category } from "./category.model";
import { Mentor } from "./mentor.model";

Category.hasMany(Event, {
  foreignKey: "category",
});

Event.belongsTo(Category, {
  foreignKey: "category",
});

Mentor.hasMany(Event, {
  foreignKey: "mentor",
});

Event.belongsTo(Mentor, {
  foreignKey: "mentor",
});

export { Event, Mentor, Category };
