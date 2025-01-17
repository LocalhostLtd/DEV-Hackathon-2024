"use client";

import { useEffect, useState } from "react";
import Search from "@/components/Search";
import ResultCard from "@/components/ResultCard";
import { Box, Stack, Typography } from "@mui/material";
import { searchImages } from "../api/pixabay/route";

import { AnimatedHamburger } from "@/components/AnimatedHamburger";
import Toolbar from "@/components/Toolbar";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [search, setSearch] = useState("");
  const [isActive, setActive] = useState(false);
  const [enterPressed, setEnterPressed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [cardData, setCardData] = useState<
    { name: string; plantType: string; caringGuide: string; imgUrl: string }[]
  >([]);

  async function gptCall(preferences: string) {
    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function parsePlants(text: string): {
    imgUrl: any;
    name: string;
    plantType: string;
    caringGuide: string;
    description: string;
  }[] {
    const plantEntries = text.split(/\d+\.\s+/); // Split text based on numbers followed by a dot and optional whitespace

    const plants = plantEntries.map((entry) => {
      const lines = entry.trim().split("\n");
      const plantInfo: {
        name: string;
        plantType: string;
        caringGuide: string;
        imgUrl: string;
        description: string;
      } = {
        name: "",
        plantType: "",
        caringGuide: "",
        imgUrl: "",
        description: "",
      };

      lines.forEach((line) => {
        if (line.startsWith("Name:")) {
          plantInfo.name = line.split(": ")[1].trim();
        } else if (line.startsWith("Plant Type:")) {
          plantInfo.plantType = line.split(": ")[1].trim();
        } else if (line.startsWith("Caring Guide:")) {
          plantInfo.caringGuide = line.split(": ")[1].trim();
        } else if (line.startsWith("Description:")) {
          plantInfo.description = line.split(": ")[1].trim();
        }
      });

      return plantInfo;
    });

    return plants.filter(
      (plant) =>
        plant.name !== "" && plant.plantType !== "" && plant.caringGuide !== ""
    );
  }

  async function generatePlants(scenario: string) {
    const output = await gptCall(scenario);

    console.log(output);
    const plantMap = parsePlants(output);
    console.log(plantMap);
    // const plantMap = [
    //   {
    //     name: "Heartleaf Philodendron",
    //     plantType: "Indoor vine",
    //     caringGuide:
    //       "Bright, indirect light. Water when top inch of soil is dry.",
    //     imgUrl:
    //       "https://pixabay.com/get/gb299173c7ed50e9e591cca48609a1d6e434a62f9b6d57611fdb846614cc50b388d7dfd2579b0d10c8bedc21df2d2024f0256f306f9626fc65965391a03fe834e_640.jpg",
    //   },
    //   {
    //     name: "String of Hearts",
    //     plantType: "Hanging succulent",
    //     caringGuide:
    //       "Bright, indirect light. Allow soil to dry between waterings.",
    //     imgUrl:
    //       "https://pixabay.com/get/g681cd8794628b71cc0874e72cb29de52faba62f8b1c59ab67fef472ca1fbd5fb945c629567af96841bbc3aaee34294af888646483caae8ebdd3498385b2a294c_640.jpg",
    //   },
    //   {
    //     name: "Anthurium",
    //     plantType: "Flowering houseplant",
    //     caringGuide:
    //       "Bright, indirect light. Keep soil consistently moist but not soggy.",
    //     imgUrl:
    //       "https://pixabay.com/get/ga83b26b7a693c4849212e7dab3e94c9e145bdc7de298c4c3e4cb542af80b4493c7a442a8d6063a1d2ab6542fc847a88afe7ea5c93b45d790ef542ab8f9243388_640.jpg",
    //   },
    // ];
    return plantMap;
  }

  const replaceSpaces = (query: string) => {
    return query.replace(/\s/g, "+");
  };

  useEffect(() => {
    console.log(search);
    async function fetchData(searchParam: string) {
      try {
        const data = await generatePlants(searchParam);

        if (data) {
          // Update cardData with imgSrc included
          const updatedCardData = await Promise.all(
            data.map(async (plant) => {
              const searchQuery = replaceSpaces(plant.name);
              const images = await searchImages(searchQuery);
              plant.imgUrl = images.hits[0]?.webformatURL || ""; // Ensure to handle case where images.hits[0] is undefined
              return plant;
            })
          );

          console.log(updatedCardData);

          // Set the updated cardData
          setCardData(updatedCardData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        // Optionally handle error state or rethrow if necessary
        setLoading(false);
      }
    }

    fetchData(search);
  }, [enterPressed]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      setEnterPressed((prev) => !prev); // Toggle to ensure useEffect triggers on every Enter press
      setLoading(true);
    }
  };

  const handleSearchClick = () => {
    setEnterPressed((prev) => !prev); // Toggle to ensure useEffect triggers on search button click
    setLoading(true);
  };

  return (
    <>
      <Typography
        variant="h2"
        sx={{
          backgroundColor: "#357960",
          color: "white",
          textAlign: "center",
          paddingTop: 10,
        }}
      >
        <b>Search for a plant</b>
      </Typography>
      <div
        className="bg-cover bg-center"
        style={{ backgroundColor: "#357960", paddingBottom: 30 }}
      >
        <Search
          search={search}
          setSearch={setSearch}
          onPress={handleKeyPress}
          onButtonClick={handleSearchClick}
        />
      </div>
      <Box
        height={"100%"}
        justifyContent={"center"}
        sx={{
          backgroundColor: "#a8c4b8",
          overflow: "auto",
          paddingTop: 5,
          paddingRight: 50,
          paddingLeft: 50,
          paddingBottom: 5,
        }}
      >
        {loading ? (
          <Typography variant="body1" align="center">
            Loading...
          </Typography>
        ) : (
          <Stack spacing={2}>
            {cardData.length === 0 ? (
              <Typography variant="body1" align="center">
                No results found.
              </Typography>
            ) : (
              cardData.map((plant) => (
                <ResultCard key={plant.name} plant={plant} />
              ))
            )}
          </Stack>
        )}
      </Box>

      <div className="fixed right-5 top-5">
        <AnimatedHamburger isActive={isActive} setActive={setActive} />
        <AnimatePresence mode="wait">
          {isActive && <Toolbar setActive={setActive} />}
        </AnimatePresence>
      </div>
    </>
  );
}
