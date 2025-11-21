import { Box, Tabs, Text } from "@chakra-ui/react";
import ItemBlog from "./component/ItemBlog";
import ForYou from "./component/ForYou";

export default function Home() {
    return (
        <Box w={'full'}>
            <Tabs.Root w={'full'} defaultValue="members" justify={'center'}>
                <Tabs.List w={'full'}>
                    <Tabs.Trigger value="members" w={'full'}>
                        <Text w={'full'} textAlign={'center'}>For you</Text>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="projects" w={'full'}>
                        <Text w={'full'} textAlign={'center'}>Following</Text>
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="members">
                    <ForYou />
                </Tabs.Content>
                <Tabs.Content value="projects">
                    Manage your projects
                </Tabs.Content>
            </Tabs.Root>
            {/* <ItemBlog 
        id={1}
        title="Título del artículo"
        description="Descripción del artículo"
        image="https://picsum.photos/200/300"
        href="/blog/1"
        tags={["tag1", "tag2"]}
        timestamp="2023-01-01"
        views={100}
        likes={50}
        comments={20}
      /> */}
        </Box>
    );
}