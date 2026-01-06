'use client';

import dynamic from 'next/dynamic';

import { useState } from 'react';
import { Button, Box } from '@chakra-ui/react';
import { MessageCircle } from 'lucide-react';

const Chatbox = dynamic(() => import('./Chatbox'), { ssr: false });

export default function ChatboxWrapper() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        setHasOpened(true);
    };

    return (
        <>
            {!isOpen && (
                <Button
                    onClick={handleOpen}
                    bg="main"
                    color="white"
                    rounded="full"
                    w="60px"
                    h="60px"
                    position="fixed"
                    bottom="6"
                    right="6"
                    zIndex={1000}
                    aria-label="Open Chat"
                    shadow="2xl"
                    _hover={{ transform: 'scale(1.1)', shadow: '0 0 20px rgba(77, 201, 230, 0.4)' }}
                    transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    animation="pulse 2s infinite"
                >
                    <MessageCircle size={28} />
                </Button>
            )}
            {hasOpened && (
                <Box display={isOpen ? 'block' : 'none'}>
                    <Chatbox
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                    />
                </Box>
            )}
        </>
    );
}
