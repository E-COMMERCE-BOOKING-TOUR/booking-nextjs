import { Box, Flex, Icon, Text, VStack } from "@chakra-ui/react"
import { FiAlertTriangle, FiGift, FiSettings } from "react-icons/fi";
import { HiDotsHorizontal } from "react-icons/hi";

const notifications = [
    {
        id: 1,
        type: "anniversary",
        icon: FiGift,
        text: "It's your X anniversary! Celebrate with a special post created just for you",
        date: "Nov 30",
        isRead: false,
    },
    {
        id: 2,
        type: "login",
        icon: FiSettings,
        text: "There was a login to your account @ph_long_03 from a new device on 19 thg 11, 2025. Review it now.",
        date: "Nov 19",
        isRead: true,
    },
    {
        id: 3,
        type: "alert",
        icon: FiAlertTriangle,
        iconColor: "red.500",
        text: "There was an attempt to log in to your account @ph_long_03 on 19 thg 11, 2025 that seems suspicious. Review it now.",
        date: "Nov 19",
        isRead: true,
    },
    {
        id: 4,
        type: "alert",
        icon: FiAlertTriangle,
        iconColor: "red.500",
        text: "There was an attempt to log in to your account @ph_long_03 on 18 thg 11, 2025 that seems suspicious. Review it now.",
        date: "Nov 18",
        isRead: true,
    },
];

export const ItemNotification = ({ notif }: { notif: typeof notifications[0] }) => {
    return (
        <Flex
            key={notif.id}
            p={4}
            backgroundColor="whiteAlpha.200"
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
            gap={3}
            _hover={{ bg: "whiteAlpha.500" }}
            cursor="pointer"
        >
            {/* Icon Column */}
            <Box pt={1}>
                {typeof notif.icon === "string" ? (
                    <Text fontSize="2xl">{notif.icon}</Text>
                ) : (
                    <Icon as={notif.icon} boxSize={8} color={notif.iconColor || "gray"} />
                )}
            </Box>

            {/* Text Column */}
            <VStack align="start" wordSpacing={1} flex={1}>
                <Text fontSize="15px" lineHeight="1.4" color={"gray"}>
                    {notif.text}
                </Text>
            </VStack>

            {/* Action/Date Column */}
            <VStack align="end" justify="space-between" wordSpacing={0}>
                <Icon as={HiDotsHorizontal} color="gray.500" boxSize={5} />
                <Text fontSize="sm" color="gray.500">
                    {notif.date}
                </Text>
            </VStack>
        </Flex>
    )
}

const ListNotification = () => {
    return (
        <VStack wordSpacing={0} align="stretch">
            {notifications.map((notif, index) => (
                <ItemNotification key={index} notif={notif} />
            ))}
        </VStack>
    )
}

export default ListNotification;
