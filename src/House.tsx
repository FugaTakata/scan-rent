import { useEffect, useState } from "react";

import {
  AspectRatio,
  Box,
  Card,
  Modal,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";

import { collection, onSnapshot, query } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

import { db, storage } from "./firebase";

interface House {
  publicUrls: string[];
  downloadUrls: string[];
  title: string;
}

function useHouses() {
  const [houses, setHouses] = useState<House[] | undefined>();
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);

  useEffect(() => {
    const rentalHousesQuery = query(collection(db, "rental_houses"));
    const unsubscribe = onSnapshot(rentalHousesQuery, async (querySnapshot) => {
      const data = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const docData = doc.data();
          const downloadUrls = await Promise.all<string[]>(
            docData.publicUrls.map(async (publicUrl: string) => {
              return getDownloadURL(ref(storage, publicUrl));
            })
          );

          return {
            ...docData,
            downloadUrls,
          };
        })
      );

      setHouses(data as House[]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { houses, selectedHouse, setSelectedHouse };
}

export function HouseContainer() {
  const { houses, selectedHouse, setSelectedHouse } = useHouses();

  const onDetailsClose = () => {
    setSelectedHouse(null);
  };

  const onHouseSelect = (house: House) => {
    setSelectedHouse(house);
  };

  return (
    <>
      <HouseListPresenter houses={houses} handleHouseSelect={onHouseSelect} />
      <HouseDetailsPresenter
        house={selectedHouse}
        handleClose={onDetailsClose}
      />
    </>
  );
}

function HouseListPresenter({
  houses,
  handleHouseSelect,
}: {
  houses: House[] | undefined;
  handleHouseSelect: (house: House) => void;
}) {
  if (houses === undefined) {
    return (
      <Stack>
        <Skeleton h={350} />
        <Skeleton h={350} />
        <Skeleton h={350} />
      </Stack>
    );
  }

  return (
    <Stack>
      {houses.map((house, index) => {
        return (
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            key={index}
            onClick={() => handleHouseSelect(house)}
            style={{ filter: "blur(0.2rem)" }}
          >
            <Card.Section withBorder inheritPadding py="xs">
              <Text fw={600}>{house.title}</Text>
            </Card.Section>

            <Card.Section>
              <AspectRatio ratio={1080 / 720} mx="auto">
                <img src={house.downloadUrls[0]} />
              </AspectRatio>
            </Card.Section>
          </Card>
        );
      })}
    </Stack>
  );
}

function HouseDetailsPresenter({
  house,
  handleClose,
}: {
  house: House | null;
  handleClose: () => void;
}) {
  const isHouseSelected = !!house;

  return (
    <Modal
      opened={isHouseSelected}
      onClose={handleClose}
      title={house?.title}
      size={"md"}
      radius={0}
      transitionProps={{ transition: "fade", duration: 100 }}
    >
      <Stack>
        {house?.downloadUrls.map((downloadUrl) => {
          return (
            <Box key={downloadUrl}>
              <AspectRatio ratio={1080 / 720} mx="auto">
                <img src={downloadUrl} />
              </AspectRatio>
            </Box>
          );
        })}
      </Stack>
    </Modal>
  );
}
