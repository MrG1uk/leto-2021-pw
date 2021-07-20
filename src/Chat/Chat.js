import React, {useEffect, useState} from "react";
import Yii2WebSockets from "../libs/yiisockets-core";
import axios from "axios";
import stringify from "qs-stringify";

const Chat = (props) => {

    const [text, setText] = useState('')
    const [chats, setChats] = useState([])
    const [messages, setMessages] = useState([])
    const [subscribed, setSubscribed] = useState(false)
    const [ws, setWs] = useState({})

    const currentChat = {name: "StasChat", id: 25}      // дан чат
    const userId = 8; //Stasik id
    const userToken = "JwZwWVr4XitK_TzJIIemdTaLQ1WAZoNi" //Stasik token
    const url = "https://chat.vallsoft.com/api"     // сервер url
    const login_tokens = {'login-token': userToken, 'connection-type': 'user'};     //пропуски


    useEffect(() => {
        let _ws = new Yii2WebSockets(login_tokens);
        _ws.connect('chat.vallsoft.com', '443', 'wss', 'wss');

        //listen for new messages and new users in chat
        _ws.addAction('new-message', function (data) {
            getChatData(currentChat.id)
        });
        _ws.addAction('status', function (data) {
            console.log(data)
        });
        setWs(_ws)
    }, [])

    function subscribeToChat() {
        //Subscribe to chat
        setMessages([])
        ws.socketSend('chat/subscribe-chat', {'chat_id': currentChat.id});
        getChatData(currentChat.id)
    }

    const getChatData = async (chat_id) => {
        await axios({
            method: 'post',
            url: url + "/chats/get-chat-data",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Authorization': userToken
            },
            data: stringify({
                chat_id: chat_id,
                offset: 0,
                messages_limit: 50
            }),
        }).then(function (response) {
            if (response.data !== '') {
                let event = response.data
                if (event.status) {
                    setMessages(event.data)
                    setSubscribed(true)
                } else {
                    console.log(event.warning)
                }
            }
        }).catch(function (error) {
            console.log(error)
        });
    }

    function sendMessage() {
        //action to trigger
        ws.socketSend('chat/send', {'text': text, 'user_id': userId, 'chat_id': currentChat.id});
        //renew chat data
        getChatData(currentChat.id)
        //empty input field
        setText('')
    }

    function renderMessages(messages) {
        let divArr = []
        let obj
        for (let key in messages) {
            obj = messages[key]
            divArr.push(
                <div className={(userId == obj.sender_id ? "myMessage " : '') + 'messageContainer '}>
                    <p style={{color: "#afb0b4", fontSize: "12px"}}>{obj.sender_name}</p>
                    <div><p style={{fontSize: "15px"}}>{obj.message}</p></div>
                </div>
            )
        }

        return divArr
    }

    return (
        <>
            <div className={'chatWindow'}>
                <p style={{color: "#afb0b4", fontSize: "25px"}}>{currentChat.name}</p>
                <button className={"smallButton"} onClick={() => subscribeToChat()}>Subscribe</button>
                <div className={'messageBlock'}>
                    {renderMessages(messages)}
                </div>
            </div>
            <div className="inputBox">
                <input
                    className={'textInput'}
                    placeholder={"Write something"}
                    type="text"
                    value={text}
                    onChange={
                        (event) => {
                            setText(event.target.value)
                        }}/>
            </div>
            <div className={'sendButton'}>
                <button className={"smallButton"} onClick={() => sendMessage()}>Send</button>
            </div>
        </>
    )
}

export default (Chat);