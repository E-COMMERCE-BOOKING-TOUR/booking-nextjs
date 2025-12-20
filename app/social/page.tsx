import { Box, Tabs, Text } from "@chakra-ui/react";
import ItemBlog from "./component/ItemBlog";
import ForYou from "./component/ForYou";

export default function Home() {
    return (
        <Box w={'full'}>
            <Tabs.Root w={'full'} defaultValue="foryou" justify={'center'}>
                <Box position="sticky" top={0} zIndex={20} bg="blackAlpha.300" backdropFilter="blur(6px)">
                    <Tabs.List w={'full'}>
                        <Tabs.Trigger
                            value="foryou"
                            w={'full'}
                            h={50}
                            _selected={{ bg: 'blackAlpha.500' }}>
                            <Text
                                w={'full'}
                                fontSize={"lg"}
                                textAlign={'center'}
                                color="white"
                            >For you</Text>
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="following"
                            w={'full'}
                            fontSize={"lg"}
                            h={50}
                            _selected={{ bg: 'blackAlpha.500' }}
                            >
                            <Text
                                w={'full'}
                                textAlign={'center'}
                                color="white"
                            >Following</Text>
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
