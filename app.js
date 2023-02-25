const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server is running at httpp://localhost.com");
    });
  } catch (e) {
    console.log(`Error is ${e.message}`);
    process.exit(1);
  }
};
intializeDbAndServer();

const convertCamToSnake = (dbobject) => {
  return {
    playerId: dbobject.player_id,
    playerName: dbobject.player_name,
    jerseyNumber: dbobject.jersey_number,
    role: dbobject.role,
  };
};
// GET Method

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
        SELECT
             * 
        FROM 
            cricket_team
        ORDER BY 
            player_id;
    `;
  const players = await db.all(getPlayerQuery);
  response.send(
    players.map((eachPlayer) => {
      return convertCamToSnake(eachPlayer);
    })
  );
});

// Add plyer(post)

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
        INSERT INTO 
            cricket_team (player_name, jersey_number, role) 
        VALUES(
            '${playerName}',
            '${jerseyNumber}',
            '${role}'
        )
         `;
  const dbResponse = await db.run(addPlayer);
  const playerId = response.player_id;
  response.send("Player Added to Team");
});

// Get player by its ID

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
        SELECT 
            * 
        FROM 
            cricket_team 
        WHERE 
            player_id = ${playerId}
    `;
  const playerDetails = await db.get(playerQuery);
  response.send(convertCamToSnake(playerDetails));
});

// PUT method

app.put("players/playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updateQuery = `
        UPDATE 
            cricket_team 
        SET 
           player_name = ${playerName},
           jersey_number = ${jerseyNumber},
           role = ${role}
        WHERE 
            player_id = ${playerId}
    `;
  await run(updateQuery);
  response.send("Player Details Updated");
});
