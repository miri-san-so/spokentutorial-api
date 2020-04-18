const mongoose = require("mongoose");
const fs = require("fs");
mongoose.connect(
  "mongodb://localhost/spokentutorial",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log("[err]" + err);
    } else {
      console.log("Connected to DB!");
    }
  }
);

let courseSchema = mongoose.Schema({
  course: String,
  title: String,
  link: String,
  foss: String,
  outline: String,
  level: String,
});

let MongoCourse = mongoose.model("Course", courseSchema);

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");

// Course Type
const CourseType = new GraphQLObjectType({
  name: "Course",
  fields: () => ({
    course: { type: GraphQLString },
    title: { type: GraphQLString },
    link: { type: GraphQLString },
    foss: { type: GraphQLString },
    outline: { type: GraphQLString },
    level: { type: GraphQLString },
  }),
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // Get all Course
    allCourses: {
      type: new GraphQLList(CourseType),
      resolve: async (parent, {}, context, info) => {
        let result = await MongoCourse.find({});
        return result;
      },
    },

    // Get number of Course
    numOfCourses: {
      type: new GraphQLList(CourseType),
      args: {
        numberOf: { type: GraphQLInt },
      },
      resolve: async (parent, args, context, info) => {
        let result = await MongoCourse.find().limit(args.numberOf);
        return result;
      },
    },

    // Get course with level
    level: {
      type: new GraphQLList(CourseType),
      args: {
        level: { type: GraphQLString },
      },
      resolve: async (parent, { level }, context, info) => {
        let result = await MongoCourse.find({ level });
        return result;
      },
    },

    // get course with course name
    course: {
      type: new GraphQLList(CourseType),
      args: {
        course: { type: GraphQLString },
      },
      resolve: async (parent, { course }, context, info) => {
        let result = await MongoCourse.find({ course });
        return result;
      },
    },

    // get course with title
    title: {
      type: new GraphQLList(CourseType),
      args: {
        title: { type: GraphQLString },
      },
      resolve: async (parent, { title }, context, info) => {
        let result = await MongoCourse.find({ title });
        return result;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // Add Course to the DB
    addCourse: {
      type: CourseType,
      args: {
        course: { type: GraphQLString },
        title: { type: GraphQLString },
        link: { type: GraphQLString },
        foss: { type: GraphQLString },
        outline: { type: GraphQLString },
        level: { type: GraphQLString },
      },
      resolve(parent, args) {
        let newEntry = new MongoCourse({
          course: args.course,
          title: args.title,
          link: args.link,
          foss: args.foss,
          outline: args.outline,
          level: args.level,
        });
        return newEntry.save();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
