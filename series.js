import https from "https";
import fs from "fs";

const options = {
  hostname: "api.pokemontcg.io",
  path: "/v2/sets",
  method: "GET",
  rejectUnauthorized: false,
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const sets = JSON.parse(data);
      const simplified = {
        data: sets.data.map((set) => ({
          name: set.name,
          series: set.series,
          images: set.images,
        })),
      };

      fs.writeFileSync(
        "pokemon_sets_simplified.json",
        JSON.stringify(simplified, null, 2)
      );
      console.log("Data saved to pokemon_sets_simplified.json");
    } catch (error) {
      console.error("Error processing data:", error);
    }
  });
});

req.on("error", (error) => {
  console.error("Error fetching data:", error);
});

req.end();
