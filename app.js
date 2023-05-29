const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const databasePath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const outputResult = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};
//API 1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { status, priority, search_q = "", category } = request.query;
  switch (true) {
    //priority and status//
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `select * from todo where status='${status}' and priority='${priority}';`;
          data = await db.all(getTodosQuery);
          response.send(data.map((eachItem) => outputResult(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    //category and status
    case hasCategoryAndStatusProperties(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (
          category === "HOME" ||
          category === "WORK" ||
          category === "LEARNING"
        ) {
          getTodosQuery = `select * from todo where status='${status}' and category='${category}';`;
          data = await db.all(getTodosQuery);
          response.send(data.map((eachItem) => outputResult(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    // category and priority//
    case hasCategoryAndPriorityProperties(request.query):
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "LOW" ||
          priority === "MEDIUM"
        ) {
          getTodosQuery = `select * from todo where priority='${priority}' and category='${category}';`;
          data = await db.all(getTodosQuery);
          response.send(data.map((eachItem) => outputResult(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //only status Property//
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `select * from todo where status='${status}';`;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachTodo) => outputResult(eachTodo)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    // only priority Property//

    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        getTodosQuery = `select * from todo where priority='${priority}';`;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => outputResult(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //category

    case hasCategoryProperty(request.query):
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `select * from todo where category='${category}';`;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => outputResult(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    //search_q//

    default:
      getTodosQuery = `select *from todo where todo like '%${search_q}%'`;
      data = await db.all(getTodosQuery);
      response.send(data.map((eachItem) => outputResult(eachItem)));
  }
});
