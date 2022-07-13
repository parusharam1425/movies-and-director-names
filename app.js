const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Convert moviex object to response object

const convertMovieObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//Convert Director Object To Response Object

const convertDirectorObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Return all Movies Query

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie
  `;
  const moviesQuery = await db.all(getMoviesQuery);
  response.send(
    moviesQuery.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// //Get Movie Id API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT 
  * 
  FROM
   movie
    WHERE
     movie_id = ${movieId}
  `;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieObjectToResponseObject(movie));
});

//Post Movie Name Into Response API

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const postMovieQuery = `
  INSERT INTO movie (director_id, movie_name, lead_actor)
  VALUES (${directorId}, "${movieName}", "${leadActor}")
  `;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//Returns a movie based on the movie ID

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;

  const getMovieById = `
  SELECT * FROM movie WHERE movie_id =${movie_id}
  `;
  const movieById = await db.get(getMovieById);

  response.send(convertMovieObjectToResponseObject(movieById));
});

//Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const { movieId } = request.params;

  const updateQuery = `
  UPDATE movie 
  SET
  director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
   WHERE
  movie_id = ${movieId};`;
  await db.get(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
