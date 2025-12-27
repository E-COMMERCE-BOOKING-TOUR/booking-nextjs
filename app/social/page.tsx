import { Box, Tabs, Text } from "@chakra-ui/react";
import ForYou from "./component/ForYou";

export default function Home() {
    return (
        <Box w={'full'}>
            <Tabs.Root w={'full'} defaultValue="foryou">
                <Box position="sticky" top={0} zIndex={50} backdropFilter="blur(6px)">
                    <Tabs.List w={'full'} gap={6} borderBottom="none" mb="2px">
                        <Tabs.Trigger
                            value="foryou"
                            h={12}
                            color="gray.500"
                            _selected={{
                                color: 'black',
                            }}
                            borderBottomWidth="2px"
                            borderBottomColor="transparent"
                            fontSize="lg"
                            fontWeight="bold"
                            px={0}
                        >
                            For you
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="following"
                            h={12}
                            color="gray.500"
                            _selected={{
                                color: 'black',
                            }}
                            borderBottomWidth="3px"
                            borderBottomColor="transparent"
                            fontSize="lg"
                            fontWeight="bold"
                            px={0}
                        >
                            Following
                        </Tabs.Trigger>
                    </Tabs.List>
                </Box>
                <Tabs.Content value="foryou">
                    <ForYou />
                </Tabs.Content>
                <Tabs.Content value="following">
                    <ForYou />
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    );
}
