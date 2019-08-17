var get = require('lodash.get');

exports.processEvents = async (event) => {
    let eventBody = event.payload.body;
    let eventHeaders = event.payload.headers;
    let queryParameters = event.payload.queryParameters;
    let returnValue = {
        events: []
    };
    let intercomEvent = get(eventBody, 'topic', false);
    if (intercomEvent === false) {
        return (returnValue);
    }
    let events = {
        "conversation.user.created": "Live Chat Conversation Started",
        "conversation.admin.closed": "Live Chat Conversation Ended",
        "conversation.user.replied": "Live Chat Message Sent",
        "conversation.admin.replied": "Live Chat Message Received",
        "conversation.admin.single.created": "Live Chat Message Received"
    };
    let eventName = function () {
        if (events[intercomEvent] !== 'null' || events[intercomEvent] !== null || events[intercomEvent] !== null) {
            return events[intercomEvent];
        } else {
            return (returnValue);
        }
    };
    if (eventName === false) {
        return (returnValue);
    }
    let item = get(eventBody, 'data["item"]', false);
    if (item === false) {
        return (returnValue);
    }
    let user = get(item, 'user', false);
    if (user === false) {
        return (returnValue);
    }
    let userId = get(user, 'user_id', false);
    if (userId === undefined || userId === null || userId === "null" || userId === "") {
        return (returnValue);
    }
    //Uses user_id field in Intercom for userId
    let userTraits = {
        userId: userId,
        email: user.email,
        name: user.name,
        type: user.type
    };
    let assignee = get(item, 'assignee', false);
    if (assignee === false) {
        return (returnValue);
    }
    // Uses Segment's Live Chat tracking spec by default
    let eventProperties = {
        agent_id: assignee.id,
        agent_username: assignee.name,
        agent_email: assignee.email,
        conversation_id: item.id,
        message_id: eventBody.id,
        conversation_url: item.links.conversation_web
    };
    returnValue = {
        events: [{
            type: 'identify',
            userId: userId,
            traits: userTraits
        },
            {
                type: 'track',
                event: eventName(),
                userId: userId,
                properties: eventProperties
            }]
    };
    return (returnValue)
};