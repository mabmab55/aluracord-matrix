import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { ButtonSendSticker} from '../src/components/ButtonSendSticker';

const SUPABABE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzM3MjAzOSwiZXhwIjoxOTU4OTQ4MDM5fQ.q1MNIOaNXry3RE3zAzcY3c8mq2-lzikHan2xDYhZOiA';
const SUPABASE_URL = 'https://jomicpykkcjhxgdxxpcp.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABABE_ANON_KEY);

function realTimeMessages(addMessage) {
    return supabaseClient
        .from('messages')
        .on('INSERT', (resposta) => {
            addMessage(resposta.new);
        })
        .subscribe();
}

export default function ChatPage() {
    /* 
    // Usuário
    - Usuário digita no campo textarea
    - Aperta enter para enviar
    - Tem que adicionar o texto(Mensagem) na listagem

    // Dev
    - Criar o campo
    - Usar o onChange e o useState (ter if para caso seja enter limpar a variavel)
    - Lista de mensagens
    */

    const roteamento = useRouter();
    const loggedUser = roteamento.query.username;
    console.log(roteamento.query)
    console.log(loggedUser)
    const [message, setMessage] = React.useState('');
    const [messageList, setMessageList] = React.useState([]);

    React.useEffect(() => {
        supabaseClient
            .from('messages')
            .select('*')
            .order('id', {ascending: false})
            .then((dados) => {
                //console.log('Dados da consulta:', dados)
                setMessageList(dados.data)
        
            });

            realTimeMessages((newMessage) => {
                // Quero reusar um valor de referencia (objeto/array) a lista de mensagem
                // Passa uma função pro setState, para puxar o atualizado
                // Caso contrário ele puxa o valor vazio que foi o primeiro adquirido na linha 39
                
                setMessageList((valorAtualDaLista) => {
                    return [
                        newMessage, 
                        ...valorAtualDaLista,
                    ]
                })
            });
    }, []);



    function handleNewMessage(newMessage) {
        const message = {
            //id: messageList.length + 1,
            from: loggedUser,
            text: newMessage,
        }

        supabaseClient
            .from('messages')
            .insert([
                //os campos do objeto (message) tem q ser OS MESMOS do supabase (from e text)
                message
            ])
            .then((dados) => {
                console.log(dados);
            })

        setMessage('')
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
                    <MessageList mensagens={messageList} />
                    {/* {messageList.map((actualMessage) => {
                        //console.log(actualMessage)
                        return (
                            <li key={actualMessage.id}>
                                {actualMessage.from}: {actualMessage.text}
                            </li>
                        )
                    })} */}
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={message}
                            onChange={function (event) {
                                //console.log(event);
                                const valor = event.target.value;
                                setMessage(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter'){
                                    //prevent default = prevenir a quebra de linha
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
                            onStickerClick={(sticker) => {
                                console.log('salva esse sticker no banco', sticker);
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
                    CHAT 
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    //console.log('MessageList', props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'hidden',
                display: 'flex',

                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >

            {props.mensagens.map((message) => {
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
                            src={`https://github.com/${message.from}.png`}
                        />
                        <Text tag="strong">
                            {message.from}
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
                    {message.text.startsWith(':sticker:') 
                        ? (
                            <Image src={message.text.replace(':sticker:', '')} />
                        )
                        : (
                            message.text
                        )}
                </Text>
                );
            })}
        </Box>
    )
}