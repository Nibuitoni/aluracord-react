import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMzMjIyNCwiZXhwIjoxOTU4OTA4MjI0fQ.zcemeQ4ZqcJkftXqhNU5s12l2BBt8vP-RimI09lRwdY'
const SUPABASE_URL = 'https://opncvjflyvuxbayaunwt.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function listenMessagesRealTime(addMessage) {
    return supabaseClient
        .from('messages')
        .on('INSERT', (responseLive) => {
            addMessage(responseLive.new);
        })
        .subscribe();
}

export default function ChatPage() {
    const routing = useRouter();
    const userLogged = routing.query.username;
    console.log('routing.query',routing.query);
    console.log('userLogged', userLogged);
    const [message, setMessage] = React.useState('');
    const [messageList, setMessageList] = React.useState([]);

    React.useEffect(() => {
        supabaseClient
            .from('messages')
            .select('*')
            .order('id', {ascending: false})
            .then(({ data }) => {
                console.log('Research data', data);
                setMessageList(data);
            });

        listenMessagesRealTime((newMessage) => {
            console.log('New message', newMessage);
            setMessageList((actualListValue) => {
                return [
                    newMessage,
                    ...actualListValue,
                ]
            });
        });
    }, []);
  
    function handleNewMessage(newMessage) {
        const message = {
            de: userLogged,
            texto: newMessage,
        };

        supabaseClient
            .from('messages')
            .insert([
                message
            ])
            .then(({ data }) => {
                console.log('Creating message', data);
            });

        setMessage('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    <MessageList messages={messageList} />
        
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={message}
                            onChange={(event) => {
                                const valor = event.target.value;
                                setMessage(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNewMessage(message);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker 
                            onStickerClick={(sticker)=> {
                                console.log('Save sticker in database', sticker);
                                handleNewMessage(':sticker:' + sticker);
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='primary'
                    colorVariant='accent'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    console.log(props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.messages.map((message) => {
                return (
                    <Text
                        key={message.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${message.de}.png`}
                            />
                            <Text tag="strong">
                                {message.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {/* Conditional: {message.texto.startsWith(':sticker:').toString()} */}
                        {message.texto.startsWith(':sticker:')? 
                        (
                            <Image src={message.texto.replace(':sticker:', '')} />
                        )
                        : (
                            message.texto
                        )}
                    </Text>
                );
            })}
        </Box>
    )
}