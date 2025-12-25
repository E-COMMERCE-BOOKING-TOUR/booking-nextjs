import { Box, Grid } from "@chakra-ui/react";
import TravelItem, { LargeTravelItem } from "./travelItem";

interface TravelDestination {
    id: number;
    image: string;
    title: string;
    toursCount: number;
    flag?: string;
}

interface TravelListProps {
    destinations: TravelDestination[];
}

export default function TravelList({ destinations }: TravelListProps) {
    const largeItems = destinations.slice(0, 2);
    const smallItems = destinations.slice(2);

    return (
        <Box>
            {largeItems.length > 0 && (
                <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
                    {largeItems.map((item) => (
                        <LargeTravelItem
                            key={item.id}
                            id={item.id}
                            image={item.image}
                            title={item.title}
                            toursCount={item.toursCount}
                            flag={item.flag}
                        />
                    ))}
                </Grid>
            )}

            {smallItems.length > 0 && (
                <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                    {smallItems.map((item) => (
                        <TravelItem
                            key={item.id}
                            id={item.id}
                            image={item.image}
                            title={item.title}
                            toursCount={item.toursCount}
                            flag={item.flag}
                        />
                    ))}
                </Grid>
            )}
        </Box>
    );
}

