'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;

var colors = [
  '#2196F3', '#32c787', '#00BCD4', '#ff5652',
  '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function leaveChat() {
  var leaveMessage = {
    sender: username,
    type: 'LEAVE'
  };
  stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(leaveMessage));

  stompClient.disconnect();

  messageInput.value = '';
  chatPage.classList.add('hidden');
  usernamePage.classList.remove('hidden');
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
}

function connect(event) {
  username = document.querySelector('#name').value.trim();

  if (username) {
    username = username.slice(0, 30);

    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
  }
  event.preventDefault();
}

function onConnected() {
  stompClient.subscribe('/topic/public', onMessageReceived);
  stompClient.send("/app/chat.addUser", {},
    JSON.stringify({ sender: username, type: 'JOIN' })
  )

  connectingElement.classList.add('hidden');
}

function onError(error) {
  connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
  connectingElement.style.color = 'red';
}

function sendMessage(event) {
  var messageContent = messageInput.value.trim();
  if (messageContent && stompClient) {
    var slicedMessage = sliceMessage(messageContent, 400);
    var formattedMessage = formatMessage(slicedMessage, 70);
    var chatMessage = {
      sender: username,
      content: formattedMessage,
      type: 'CHAT'
    };
    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    messageInput.value = '';
  }
  event.preventDefault();
}

function sliceMessage(message, maxLength) {
  return message.slice(0, maxLength);
}

function formatMessage(message, maxLineLength) {
  var lines = [];
  while (message.length > maxLineLength) {
    lines.push(message.slice(0, maxLineLength));
    message = message.slice(maxLineLength);
  }
  lines.push(message);
  return lines.join('\n');
}

function onMessageReceived(payload) {
  var message = JSON.parse(payload.body);

  var messageElement = document.createElement('li');

  if (message.type === 'JOIN') {
    messageElement.classList.add('event-message');
    messageElement.textContent = message.sender + ' joined';
  } else if (message.type === 'LEAVE') {
     var existingLeaveMessage = document.querySelector('.event-message.leave-message');
     if (existingLeaveMessage) {
       return;
     }
    messageElement.classList.add('event-message', 'leave-message');
    messageElement.textContent = message.sender + ' left';
  } else {
    messageElement.classList.add('chat-message');

    var avatarElement = document.createElement('i');
    var avatarText = document.createTextNode(message.sender[0]);
    avatarElement.appendChild(avatarText);
    avatarElement.style['background-color'] = getAvatarColor(message.sender);

    messageElement.appendChild(avatarElement);

    var usernameElement = document.createElement('span');
    var usernameText = document.createTextNode(message.sender);
    usernameElement.appendChild(usernameText);

    if (message.sender === username) {
      var currentUserText = document.createTextNode(" (You)  ");
      usernameElement.appendChild(currentUserText);
    }

    messageElement.appendChild(usernameElement);

    var timestampElement = document.createElement('span');
    var timestampText = document.createTextNode(getFormattedTimestamp());
    timestampElement.appendChild(timestampText);
    timestampElement.classList.add('timestamp');
    messageElement.appendChild(timestampElement);

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);

    var copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.classList.add('copy-button');
    copyButton.addEventListener('click', function () {
      copyTextToClipboard(message.content);
    });
    messageElement.appendChild(copyButton);
  }

  messageArea.appendChild(messageElement);
  messageArea.scrollTop = messageArea.scrollHeight;
}

function copyTextToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function getAvatarColor(messageSender) {
  var hash = 0;
  for (var i = 0; i < messageSender.length; i++) {
    hash = 31 * hash + messageSender.charCodeAt(i);
  }
  var index = Math.abs(hash % colors.length);
  return colors[index];
}

function getFormattedTimestamp() {
  var currentDatetime = new Date();
  var hours = currentDatetime.getHours();
  var minutes = currentDatetime.getMinutes();
  var seconds = currentDatetime.getSeconds();
  var month = currentDatetime.getMonth() + 1;
  var day = currentDatetime.getDate();
  var year = currentDatetime.getFullYear();

  return (
    ' ' +
    leadingZero(hours) +
    ':' +
    leadingZero(minutes) +
    ' ' +
    leadingZero(day) +
    '.' +
    leadingZero(month) +
    '.' +
    year +
    ' '
  );
}

function leadingZero(number) {
  return number < 10 ? '0' + number : number;
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
document.getElementById('messageForm').addEventListener('submit', sendMessage);
