import { Box, Grid } from "@chakra-ui/react";
import TravelItem from "./travelItem";

interface TravelDestination {
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
                    {largeItems.map((item, index) => (
                        <TravelItem.large
                            key={index}
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
                    {smallItems.map((item, index) => (
                        <TravelItem
                            key={index + 2}
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

